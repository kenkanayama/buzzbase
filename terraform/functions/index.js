/**
 * BuzzBase - Instagram OAuth Callback Handler
 * Cloud Functions 1st Gen
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Firestore, FieldValue } = require('@google-cloud/firestore');
// Node.js 20 has native fetch API

// =============================================================================
// 定数
// =============================================================================

const META_APP_ID = '1395033632016244';
const PROJECT_ID = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
const SECRET_NAME = `projects/${PROJECT_ID}/secrets/meta-instagram-app-secret/versions/latest`;

// フロントエンドURL（環境変数から取得、デフォルトは本番URL）
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://buzzbase-444823.web.app';

// Firestoreクライアント
const firestore = new Firestore();

// Secret Managerクライアント
const secretClient = new SecretManagerServiceClient();

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * Secret Managerからアプリシークレットを取得
 */
async function getAppSecret() {
  try {
    const [version] = await secretClient.accessSecretVersion({ name: SECRET_NAME });
    return version.payload.data.toString();
  } catch (error) {
    console.error('Secret Manager エラー:', error);
    throw new Error('アプリシークレットの取得に失敗しました');
  }
}

/**
 * 認可コードを短期アクセストークンに交換
 */
async function exchangeCodeForToken(code, redirectUri, appSecret) {
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    client_secret: appSecret,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code: code,
  });

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('トークン交換エラー:', errorText);
    throw new Error('トークン交換に失敗しました');
  }

  return response.json();
}

/**
 * 短期トークンを長期トークンに交換
 */
async function exchangeForLongLivedToken(shortLivedToken, appSecret) {
  const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('長期トークン交換エラー:', errorText);
    throw new Error('長期トークン交換に失敗しました');
  }

  return response.json();
}

/**
 * Instagramユーザー情報を取得
 */
async function getInstagramUserInfo(accessToken) {
  const url = `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url&access_token=${accessToken}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ユーザー情報取得エラー:', errorText);
    throw new Error('ユーザー情報の取得に失敗しました');
  }

  return response.json();
}

/**
 * FirestoreにInstagramアカウント情報を保存
 */
async function saveInstagramAccount(userId, accountData) {
  const userRef = firestore.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error('ユーザーが見つかりません');
  }

  const userData = userDoc.data();
  const existingAccounts = userData.instagramAccounts || [];

  // 既存のアカウントを更新または新規追加
  const accountIndex = existingAccounts.findIndex(
    (acc) => acc.accountId === accountData.accountId
  );

  if (accountIndex >= 0) {
    // 既存アカウントを更新
    existingAccounts[accountIndex] = {
      ...existingAccounts[accountIndex],
      ...accountData,
    };
  } else {
    // 新規アカウントを追加
    existingAccounts.push(accountData);
  }

  await userRef.update({
    instagramAccounts: existingAccounts,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// =============================================================================
// Cloud Function: Instagram OAuth コールバック
// =============================================================================

/**
 * Instagram認証コールバック
 * HTTPトリガー（GET）
 */
exports.instagramCallback = async (req, res) => {
  // CORSヘッダー設定
  res.set('Access-Control-Allow-Origin', '*');

  // プリフライトリクエスト対応
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  const { code, state, error, error_reason } = req.query;

  console.log('Instagram callback received:', {
    hasCode: !!code,
    state,
    error,
    error_reason,
  });

  // エラーチェック（ユーザーがキャンセルした場合など）
  if (error) {
    console.error('Instagram認証エラー:', error, error_reason);
    return res.redirect(`${FRONTEND_URL}/dashboard?error=instagram_denied`);
  }

  // パラメータチェック
  if (!code) {
    console.error('認可コードがありません');
    return res.redirect(`${FRONTEND_URL}/dashboard?error=missing_code`);
  }

  if (!state) {
    console.error('stateパラメータがありません');
    return res.redirect(`${FRONTEND_URL}/dashboard?error=missing_state`);
  }

  try {
    // stateからユーザーIDを取得
    const userId = state;

    // リダイレクトURIを構築（Metaに登録したものと一致する必要がある）
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('host');
    const redirectUri = `${protocol}://${host}${req.path}`;

    console.log('Redirect URI:', redirectUri);

    // 1. アプリシークレットを取得
    const appSecret = await getAppSecret();

    // 2. 認可コードを短期トークンに交換
    console.log('認可コードをトークンに交換中...');
    const tokenData = await exchangeCodeForToken(code, redirectUri, appSecret);
    console.log('トークン交換成功');

    // トークンデータの構造を確認（Instagram APIは配列で返す場合がある）
    let accessToken, instagramUserId;
    if (tokenData.data && Array.isArray(tokenData.data)) {
      accessToken = tokenData.data[0].access_token;
      instagramUserId = tokenData.data[0].user_id;
    } else {
      accessToken = tokenData.access_token;
      instagramUserId = tokenData.user_id;
    }

    // 3. 短期トークンを長期トークンに交換
    console.log('長期トークンに交換中...');
    const longLivedData = await exchangeForLongLivedToken(accessToken, appSecret);
    console.log('長期トークン取得成功');

    // 4. Instagramユーザー情報を取得
    console.log('ユーザー情報取得中...');
    const userInfo = await getInstagramUserInfo(longLivedData.access_token);
    console.log('ユーザー情報取得成功:', userInfo.username);

    // 5. Firestoreに保存
    console.log('Firestoreに保存中...');
    const accountData = {
      accountId: userInfo.id,
      username: userInfo.username,
      name: userInfo.name || '',
      profile_picture_url: userInfo.profile_picture_url || '',
      accessToken: longLivedData.access_token,
      tokenExpiresAt: new Date(Date.now() + longLivedData.expires_in * 1000),
      connectedAt: new Date(),
    };

    await saveInstagramAccount(userId, accountData);
    console.log('Firestore保存成功');

    // 6. フロントエンドにリダイレクト（成功）
    res.redirect(`${FRONTEND_URL}/dashboard?instagram_connected=true`);

  } catch (err) {
    console.error('Instagram連携処理エラー:', err);
    res.redirect(`${FRONTEND_URL}/dashboard?error=instagram_error&message=${encodeURIComponent(err.message)}`);
  }
};
