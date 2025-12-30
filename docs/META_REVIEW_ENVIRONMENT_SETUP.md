# Meta審査用環境の設定手順

## 概要

Meta審査用のCloud Runサービス（`buzzbase-review`）を本番環境とは別にデプロイし、すべての機能が動作するようにするための設定手順です。

## 審査用環境のURL

- **審査用URL**: `https://buzzbase-review-1028492470102.asia-northeast1.run.app`
- **本番URL**: `https://buzzbase-1028492470102.asia-northeast1.run.app`

## 必要な手動設定

### 1. Firebase Authentication の認証済みリダイレクトURI

#### 設定場所
[Firebase Console - Authentication Settings](https://console.firebase.google.com/project/sincere-kit/authentication/settings)

#### 設定手順

1. Firebase Console にアクセス
2. 「Authentication」→「Settings」タブを選択
3. 「Authorized domains」セクションを確認
4. 以下のドメインが追加されていることを確認（なければ追加）:
   - `buzzbase-review-1028492470102.asia-northeast1.run.app`
   - `buzzbase-1028492470102.asia-northeast1.run.app`（既存）

#### 注意事項

- Firebase Authentication は、認証済みドメインからのリクエストのみを受け付けます
- 審査用環境のドメインを追加しないと、Google認証やメール認証が失敗します

---

### 2. Meta App (Instagram) のValid OAuth Redirect URIs

#### 設定場所
[Meta Developer Console - Instagram Basic Display](https://developers.facebook.com/apps/1395033632016244/instagram-basic-display/basic-display/)

#### 設定手順

1. Meta Developer Console にアクセス
2. アプリ `1395033632016244` を選択
3. 「Instagram Basic Display」→「Basic Display」を選択
4. 「Valid OAuth Redirect URIs」セクションを確認
5. 以下のURLが登録されていることを確認（既に登録済み）:
   ```
   https://asia-northeast1-sincere-kit.cloudfunctions.net/instagramCallback
   ```

#### 注意事項

- OAuthコールバックURLはCloud FunctionsのURLなので、審査用環境でも同じURLを使用します
- Cloud Functions側でリクエストのOriginヘッダーから適切なフロントエンドURLにリダイレクトするため、Meta App側の設定変更は不要です

---

## コード側の対応（完了済み）

### 1. Cloud Functions の修正

- `getFrontendUrl()` 関数を追加し、リクエストのOriginヘッダーから適切なフロントエンドURLを判断
- 許可されたフロントエンドURLのリストを定義:
  - `https://buzzbase-1028492470102.asia-northeast1.run.app`（本番）
  - `https://buzzbase-review-1028492470102.asia-northeast1.run.app`（審査用）

### 2. フロントエンドの修正

- OAuthリクエスト時に、現在のフロントエンドURLをstateパラメータに含めるように変更
- Cloud Functions側でstateからフロントエンドURLを取得し、適切なURLにリダイレクト

---

## 動作確認

### 1. 認証機能の確認

1. 審査用URLにアクセス: `https://buzzbase-review-1028492470102.asia-northeast1.run.app`
2. Google認証またはメール認証でログイン
3. 正常にログインできることを確認

### 2. Instagram連携機能の確認

1. ダッシュボードから「Connect Instagram」をクリック
2. Instagram認証画面が表示されることを確認
3. 認証完了後、審査用URLのダッシュボードにリダイレクトされることを確認
4. Instagramアカウントが連携されていることを確認

### 3. PR投稿登録機能の確認

1. PR投稿を登録
2. 登録直後にインサイトデータが取得されることを確認
3. ダッシュボードでインサイト数値が表示されることを確認

---

## トラブルシューティング

### 認証エラーが発生する場合

- Firebase Consoleで審査用ドメインが追加されているか確認
- ブラウザのコンソールでエラーメッセージを確認

### Instagram連携が失敗する場合

- Cloud Functionsのログを確認
- リクエストのOriginヘッダーが正しく送信されているか確認

### リダイレクト先が間違っている場合

- Cloud Functionsのログで `frontendUrl` が正しく取得されているか確認
- stateパラメータにフロントエンドURLが含まれているか確認

---

## 関連ドキュメント

- [Firebase Authentication 設定](./GCP_MANUAL_CONFIGURATION.md#1-firebase-authentication)
- [Meta App 設定](./GCP_MANUAL_CONFIGURATION.md#-meta-app-instagramfacebook)

