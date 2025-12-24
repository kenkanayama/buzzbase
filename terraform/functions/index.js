/**
 * BuzzBase - Instagram OAuth Callback Handler
 * Cloud Functions 1st Gen
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Firestore, FieldValue } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
// Node.js 20 has native fetch API

// =============================================================================
// 定数
// =============================================================================

const META_APP_ID = '1395033632016244';
const PROJECT_ID = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
const SECRET_NAME = `projects/${PROJECT_ID}/secrets/meta-instagram-app-secret/versions/latest`;

// フロントエンドURL（環境変数から取得、デフォルトは本番URL）
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://buzzbase-1028492470102.asia-northeast1.run.app';

// プロフィール画像保存用バケット名
const PROFILE_IMAGES_BUCKET = process.env.PROFILE_IMAGES_BUCKET || `${PROJECT_ID}-profile-images`;

// 投稿サムネイル保存用バケット名
const POST_THUMBNAILS_BUCKET = process.env.POST_THUMBNAILS_BUCKET || 'sincere-kit-post-thumbnails';

// Cloud Storageクライアント
const storage = new Storage();

// Instagram OAuth コールバックURL（固定値 - Metaアプリコンソールに登録したものと一致させる）
const INSTAGRAM_CALLBACK_URL = 'https://asia-northeast1-sincere-kit.cloudfunctions.net/instagramCallback';

// Firestoreクライアント（プロジェクトID・データベースIDを明示的に指定）
// データベース名: sincere-kit-buzzbase（名前付きデータベース）
const FIRESTORE_DATABASE_ID = 'sincere-kit-buzzbase';
const firestore = new Firestore({
  projectId: PROJECT_ID || 'sincere-kit',
  databaseId: FIRESTORE_DATABASE_ID,
});

// Secret Managerクライアント
const secretClient = new SecretManagerServiceClient();

// Firebase Admin SDK初期化（Cloud Functions環境では自動的に認証情報が設定される）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

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
 * instagramAccountsコレクションにトークン情報を保存
 */
async function saveInstagramToken(accountId, tokenData) {
  const tokenRef = firestore.collection('instagramAccounts').doc(accountId);
  
  await tokenRef.set({
    accountId: accountId,
    username: tokenData.username,
    accessToken: tokenData.accessToken,
    tokenExpiresAt: tokenData.tokenExpiresAt,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  
  console.log(`instagramAccountsコレクションに保存: ${accountId}`);
}

/**
 * プロフィール画像をCloud Storageに保存
 * @param {string} accountId - InstagramアカウントID
 * @param {string} imageUrl - Instagramから取得した画像URL
 * @returns {Promise<string|null>} - Cloud StorageのURL、画像がない場合はnull
 */
async function saveProfileImageToStorage(accountId, imageUrl) {
  if (!imageUrl) {
    console.log('プロフィール画像URLがありません');
    return null;
  }

  try {
    // 画像をダウンロード
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('プロフィール画像ダウンロードエラー:', response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Content-Typeを取得（デフォルトはjpeg）
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : 'jpg';

    // Cloud Storageにアップロード
    const fileName = `instagram/${accountId}.${extension}`;
    const bucket = storage.bucket(PROFILE_IMAGES_BUCKET);
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: contentType,
        cacheControl: 'public, max-age=86400', // 24時間キャッシュ
      },
    });

    // 公開URLを生成
    const publicUrl = `https://storage.googleapis.com/${PROFILE_IMAGES_BUCKET}/${fileName}`;
    console.log(`プロフィール画像をCloud Storageに保存: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('プロフィール画像保存エラー:', error);
    return null;
  }
}

/**
 * usersコレクションにInstagramアカウント情報を保存（Map形式）
 */
async function saveInstagramAccountToUser(userId, accountData) {
  const userRef = firestore.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error('ユーザーが見つかりません');
  }

  // Map形式でアカウント情報を更新（キー: accountId）
  const accountUpdate = {
    [`instagramAccounts.${accountData.accountId}`]: {
      username: accountData.username,
      name: accountData.name,
      profile_picture_url: accountData.profile_picture_url,
    },
    updatedAt: FieldValue.serverTimestamp(),
  };

  await userRef.update(accountUpdate);
  console.log(`usersコレクションに保存: userId=${userId}, accountId=${accountData.accountId}`);
}

// =============================================================================
// ユーティリティ関数（追加）
// =============================================================================

/**
 * FirestoreからInstagramアカウントのトークンを取得
 * @param {string} accountId - InstagramアカウントID
 * @returns {Promise<{accessToken: string, tokenExpiresAt: Date} | null>}
 */
async function getInstagramToken(accountId) {
  try {
    const tokenRef = firestore.collection('instagramAccounts').doc(accountId);
    const tokenDoc = await tokenRef.get();
    
    if (!tokenDoc.exists) {
      return null;
    }
    
    const data = tokenDoc.data();
    return {
      accessToken: data.accessToken,
      tokenExpiresAt: data.tokenExpiresAt.toDate(),
    };
  } catch (error) {
    console.error('トークン取得エラー:', error);
    throw error;
  }
}

/**
 * Instagram Graph APIからメディア一覧を取得
 * @param {string} accountId - InstagramアカウントID
 * @param {string} accessToken - アクセストークン
 * @returns {Promise<object>} Instagram APIレスポンス
 */
async function getInstagramMedia(accountId, accessToken) {
  const INSTAGRAM_API_VERSION = 'v24.0';
  const apiUrl = `https://graph.instagram.com/${INSTAGRAM_API_VERSION}/${accountId}?fields=media{id,media_type,media_url,thumbnail_url,timestamp,permalink}&access_token=${accessToken}`;
  
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Instagram API error:', errorData);
    throw new Error(errorData.error?.message || 'Instagram APIエラー');
  }
  
  return response.json();
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

    // リダイレクトURIは固定値を使用（Metaアプリコンソールに登録したものと完全一致させる）
    const redirectUri = INSTAGRAM_CALLBACK_URL;

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

    // 5. プロフィール画像をCloud Storageに保存
    console.log('プロフィール画像をCloud Storageに保存中...');
    const accountId = userInfo.id;
    const storedImageUrl = await saveProfileImageToStorage(accountId, userInfo.profile_picture_url);
    
    // 6. Firestoreに保存
    console.log('Firestoreに保存中...');
    
    const tokenExpiresAt = new Date(Date.now() + longLivedData.expires_in * 1000);
    
    // 6a. instagramAccountsコレクションにトークン情報を保存
    await saveInstagramToken(accountId, {
      username: userInfo.username,
      accessToken: longLivedData.access_token,
      tokenExpiresAt: tokenExpiresAt,
    });
    
    // 6b. usersコレクションにアカウント情報を保存（Map形式）
    // Cloud Storageに保存したURLを使用（有効期限なし）
    await saveInstagramAccountToUser(userId, {
      accountId: accountId,
      username: userInfo.username,
      name: userInfo.name || '',
      profile_picture_url: storedImageUrl || '', // Cloud StorageのURL
    });
    
    console.log('Firestore保存成功');

    // 7. フロントエンドにリダイレクト（成功）
    res.redirect(`${FRONTEND_URL}/dashboard?instagram_connected=true`);

  } catch (err) {
    console.error('Instagram連携処理エラー:', err);
    res.redirect(`${FRONTEND_URL}/dashboard?error=instagram_error&message=${encodeURIComponent(err.message)}`);
  }
};

// =============================================================================
// Cloud Function: Instagram投稿取得
// =============================================================================

/**
 * Instagram投稿一覧を取得
 * HTTPトリガー（GET）
 * 
 * 認証: Firebase Authentication IDトークンをAuthorizationヘッダーで受け取る
 * 
 * リクエスト:
 *   GET /getInstagramMedia?accountId={accountId}
 *   Headers:
 *     Authorization: Bearer {Firebase ID Token}
 * 
 * レスポンス:
 *   200 OK: { media: { data: [...] } }
 *   400 Bad Request: { error: "..." }
 *   401 Unauthorized: { error: "..." }
 *   404 Not Found: { error: "..." }
 */
exports.getInstagramMedia = async (req, res) => {
  // CORSヘッダー設定
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // プリフライトリクエスト対応
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // メソッドチェック
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { accountId } = req.query;

  // パラメータチェック
  if (!accountId) {
    res.status(400).json({ error: 'accountIdパラメータが必要です' });
    return;
  }

  // 認証チェック（Firebase IDトークン）
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  if (!idToken) {
    res.status(401).json({ error: '無効な認証トークンです' });
    return;
  }

  // Firebase Admin SDKでトークンを検証
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('トークン検証エラー:', error);
    res.status(401).json({ error: '認証トークンの検証に失敗しました' });
    return;
  }

  const userId = decodedToken.uid;

  try {
    // 1. ユーザーがこのアカウントを連携しているか確認
    const userRef = firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      res.status(404).json({ error: 'ユーザーが見つかりません' });
      return;
    }
    
    const userData = userDoc.data();
    if (!userData.instagramAccounts || !userData.instagramAccounts[accountId]) {
      res.status(403).json({ error: 'このInstagramアカウントへのアクセス権限がありません' });
      return;
    }

    // 2. Firestoreからトークンを取得
    const tokenData = await getInstagramToken(accountId);
    
    if (!tokenData) {
      res.status(404).json({ error: 'Instagramアカウントのトークンが見つかりません。再連携が必要です。' });
      return;
    }

    // 3. トークンの有効期限をチェック
    if (tokenData.tokenExpiresAt < new Date()) {
      res.status(400).json({ error: 'Instagramのアクセストークンが期限切れです。再連携してください。' });
      return;
    }

    // 4. Instagram Graph APIからメディア一覧を取得
    const mediaData = await getInstagramMedia(accountId, tokenData.accessToken);

    // 5. レスポンスを返す
    res.status(200).json(mediaData);

  } catch (err) {
    console.error('Instagram投稿取得エラー:', err);
    res.status(500).json({ 
      error: '投稿の取得に失敗しました',
      message: err.message 
    });
  }
};

// =============================================================================
// Cloud Function: サムネイル画像保存
// =============================================================================

/**
 * 投稿サムネイル画像をCloud Storageに保存
 * HTTPトリガー（POST）
 * 
 * 認証: Firebase Authentication IDトークンをAuthorizationヘッダーで受け取る
 * 
 * リクエスト:
 *   POST /saveThumbnailToStorage
 *   Headers:
 *     Authorization: Bearer {Firebase ID Token}
 *     Content-Type: application/json
 *   Body:
 *     { thumbnailUrl: string, accountId: string, mediaId: string }
 * 
 * レスポンス:
 *   200 OK: { url: string }
 *   400 Bad Request: { error: "..." }
 *   401 Unauthorized: { error: "..." }
 *   500 Internal Server Error: { error: "..." }
 */
exports.saveThumbnailToStorage = async (req, res) => {
  // CORSヘッダー設定
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // プリフライトリクエスト対応
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // メソッドチェック
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 認証チェック（Firebase IDトークン）
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  if (!idToken) {
    res.status(401).json({ error: '無効な認証トークンです' });
    return;
  }

  // Firebase Admin SDKでトークンを検証
  try {
    await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('トークン検証エラー:', error);
    res.status(401).json({ error: '認証トークンの検証に失敗しました' });
    return;
  }

  const { thumbnailUrl, accountId, mediaId } = req.body;

  // パラメータチェック
  if (!thumbnailUrl) {
    res.status(400).json({ error: 'thumbnailUrlが必要です' });
    return;
  }

  if (!accountId) {
    res.status(400).json({ error: 'accountIdが必要です' });
    return;
  }

  if (!mediaId) {
    res.status(400).json({ error: 'mediaIdが必要です' });
    return;
  }

  try {
    // 画像をダウンロード
    console.log(`サムネイルをダウンロード中: ${thumbnailUrl}`);
    const response = await fetch(thumbnailUrl);
    
    if (!response.ok) {
      console.error('サムネイルダウンロードエラー:', response.status);
      res.status(400).json({ error: '画像のダウンロードに失敗しました' });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Content-Typeを取得（デフォルトはjpeg）
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : 'jpg';

    // Cloud Storageにアップロード
    // ファイル名: {accountId}/{mediaId}.{extension}
    const fileName = `${accountId}/${mediaId}.${extension}`;
    const bucket = storage.bucket(POST_THUMBNAILS_BUCKET);
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: contentType,
        cacheControl: 'public, max-age=86400', // 24時間キャッシュ
      },
    });

    // 公開URLを生成
    const publicUrl = `https://storage.googleapis.com/${POST_THUMBNAILS_BUCKET}/${fileName}`;
    console.log(`サムネイルをCloud Storageに保存: ${publicUrl}`);

    res.status(200).json({ url: publicUrl });

  } catch (err) {
    console.error('サムネイル保存エラー:', err);
    res.status(500).json({ 
      error: 'サムネイルの保存に失敗しました',
      message: err.message 
    });
  }
};
