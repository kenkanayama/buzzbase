# 🛠️ BuzzBase 開発ガイド

## 📋 開発環境のセットアップ

### ローカル開発用サービスアカウントの設定

1. **サービスアカウントファイルの配置**
   
   `gcp-service-account.json` をプロジェクトルートに配置してください。
   このファイルは `.gitignore` に含まれており、GitHubにはコミットされません。

2. **環境変数の設定**

   ```bash
   # Google Cloud 認証情報の設定
   export GOOGLE_APPLICATION_CREDENTIALS="./gcp-service-account.json"
   ```

3. **gcloud CLI での認証（代替方法）**

   ```bash
   gcloud auth application-default login
   ```

### 必要なロールの追加

開発を進める中で必要に応じて、ローカル開発用サービスアカウントに以下のロールを追加してください：

```bash
# Firestore へのアクセス
gcloud projects add-iam-policy-binding sincere-kit \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/datastore.user"

# Cloud Run の管理
gcloud projects add-iam-policy-binding sincere-kit \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/run.admin"

# Artifact Registry へのアクセス
gcloud projects add-iam-policy-binding sincere-kit \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/artifactregistry.admin"
```

## 🔥 Firebase 設定

### Firebase Console での設定

1. [Firebase Console](https://console.firebase.google.com/project/sincere-kit) にアクセス
2. 「プロジェクトの設定」→「全般」からWeb APIキーを取得
3. `.env` ファイルに設定を追加

### .env ファイルの例

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=sincere-kit.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sincere-kit
VITE_FIREBASE_STORAGE_BUCKET=sincere-kit.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Emulator を使用する場合
VITE_USE_FIREBASE_EMULATOR=true
```

## 🐳 Docker での開発

### 開発サーバーの起動

```bash
# フロントエンドのみ
docker compose up frontend

# Firebase Emulator も含める
docker compose --profile emulator up
```

### イメージのリビルド

```bash
docker compose build --no-cache
```

## 📁 プロジェクト構造

```
buzz_base/
├── docs/               # ドキュメント
│   ├── PROJECT_CONFIG.md  # プロジェクト設定（非公開）
│   ├── SETUP_CICD.md      # CI/CD セットアップガイド
│   └── DEVELOPMENT.md     # このファイル
├── terraform/          # インフラ定義
├── frontend/           # React アプリ
├── firebase/           # Firestore ルール
├── functions/          # Cloud Functions（今後追加）
└── cloudbuild.yaml     # CI/CD 設定
```

## 🧪 テスト

```bash
cd frontend

# 型チェック
npm run type-check

# リント
npm run lint

# プレビュービルド
npm run build && npm run preview
```

## 🚀 手動デプロイ（テスト用）

```bash
# イメージをビルド
docker build -t asia-northeast1-docker.pkg.dev/sincere-kit/buzzbase/frontend:test .

# Artifact Registry にプッシュ
docker push asia-northeast1-docker.pkg.dev/sincere-kit/buzzbase/frontend:test

# Cloud Run にデプロイ
gcloud run deploy buzzbase \
  --image asia-northeast1-docker.pkg.dev/sincere-kit/buzzbase/frontend:test \
  --region asia-northeast1 \
  --platform managed \
  --allow-unauthenticated
```

## 📝 コーディング規約

- **TypeScript** を使用（strict mode）
- **ESLint** でコード品質をチェック
- **Tailwind CSS** でスタイリング
- **コンポーネント** は機能別にディレクトリ分け
- **コミットメッセージ** は日本語または英語で簡潔に

## 🔗 参考リンク

- [GCP Console](https://console.cloud.google.com/home/dashboard?project=sincere-kit)
- [Firebase Console](https://console.firebase.google.com/project/sincere-kit)
- [Cloud Build 履歴](https://console.cloud.google.com/cloud-build/builds?project=sincere-kit)
- [Cloud Run サービス](https://console.cloud.google.com/run?project=sincere-kit)

