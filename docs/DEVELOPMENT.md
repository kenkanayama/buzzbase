# 🛠️ BuzzBase 開発ガイド

このドキュメントでは、BuzzBase の開発環境セットアップと開発フローについて説明します。

---

## 📋 クイックスタート

```bash
# 1. プロジェクトディレクトリに移動
cd /Users/ken.kanayama/kenkanayama/adhoc/buzz_base

# 2. 環境変数を設定
cp env.example .env
# .env を編集して Firebase 設定を入力

# 3. 依存関係をインストール
docker compose exec frontend npm install
# または: cd frontend && npm install

# 4. 開発サーバーを起動
docker compose up frontend
# ブラウザで http://localhost:5173 にアクセス
```

---

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
# サービスアカウントのメールアドレスを確認
SA_EMAIL=$(cat gcp-service-account.json | jq -r '.client_email')

# Firestore へのアクセス
gcloud projects add-iam-policy-binding sincere-kit \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/datastore.user"

# Cloud Run の管理
gcloud projects add-iam-policy-binding sincere-kit \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

# Artifact Registry へのアクセス
gcloud projects add-iam-policy-binding sincere-kit \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.admin"
```

---

## 🔥 Firebase 設定

### Firebase Console での設定

1. [Firebase Console](https://console.firebase.google.com/project/sincere-kit) にアクセス
2. 「プロジェクトの設定」→「全般」からWeb APIキーを取得
3. `.env` ファイルに設定を追加

### .env ファイルの設定

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

---

## 🐳 Docker での開発

### 開発サーバーの起動

```bash
# フロントエンドのみ
docker compose up frontend

# Firebase Emulator も含める
docker compose --profile emulator up

# バックグラウンドで起動
docker compose up -d frontend
```

### npm コマンドの実行

```bash
# パッケージのインストール
docker compose exec frontend npm install <package>

# リント
docker compose exec frontend npm run lint

# 型チェック
docker compose exec frontend npm run type-check

# ビルド
docker compose exec frontend npm run build
```

### イメージのリビルド

```bash
docker compose build --no-cache
```

---

## 📁 プロジェクト構造

```
buzz_base/
├── docs/                   # ドキュメント
│   ├── PROJECT_CONFIG.md   # プロジェクト設定（非公開）
│   ├── SETUP_CICD.md       # CI/CD セットアップガイド
│   └── DEVELOPMENT.md      # このファイル
├── terraform/              # インフラ定義
├── frontend/               # React アプリ
│   ├── src/
│   │   ├── components/     # UIコンポーネント
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # カスタムフック
│   │   ├── lib/            # ユーティリティ
│   │   ├── pages/          # ページコンポーネント
│   │   ├── styles/         # グローバルスタイル
│   │   └── types/          # 型定義
│   └── public/             # 静的ファイル
├── firebase/               # Firestore ルール/インデックス
├── functions/              # Cloud Functions（今後追加）
├── cloudbuild.yaml         # CI/CD 設定
├── docker-compose.yml      # 開発環境
├── Dockerfile              # 本番用
└── Dockerfile.dev          # 開発用
```

---

## 🧪 コード品質

### リント・型チェック

```bash
# Docker環境内で実行
docker compose exec frontend npm run type-check  # 型チェック
docker compose exec frontend npm run lint        # リント
docker compose exec frontend npm run build       # ビルド確認
```

### コミット前の必須チェック

**⚠️ 重要**: `frontend/` ディレクトリ内のファイルに変更がある場合は、**必ず以下のチェックを実行してからコミットすること**。

```bash
# 型チェック
docker compose exec frontend npm run type-check

# ビルドチェック（型チェックも含む）
docker compose exec frontend npm run build
```

**チェックが失敗した場合：**
- エラーを修正してから再度チェックを実行する
- すべてのチェックが成功するまでコミットしない

**よくあるエラー例：**
- `TS6133: 'xxx' is declared but its value is never read.` → 未使用のインポートを削除
- `TS2345: Argument of type 'xxx' is not assignable...` → 型の不整合を修正

### pre-commit フック

husky + lint-staged によるpre-commitフックが導入済みです。
コミット時に以下が自動実行されます：

- ステージされた `.ts`, `.tsx` ファイルに対して ESLint + Prettier
- ステージされた `.js`, `.jsx`, `.json`, `.css`, `.md` ファイルに対して Prettier

---

## 🚀 デプロイ

### 自動デプロイ（推奨）

`main` ブランチへの push で Cloud Build が自動的にデプロイを実行します。

```bash
git add .
git commit -m "feat: 新機能を追加"
git push origin main
```

### 手動デプロイ（テスト用）

```bash
# Docker 認証設定
gcloud auth configure-docker asia-northeast1-docker.pkg.dev

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

---

## 📝 コーディング規約

### 全般
- **TypeScript** を使用（strict mode）
- **ESLint** でコード品質をチェック
- **Tailwind CSS** でスタイリング
- `any` 型の使用は避ける

### ファイル命名規則
- コンポーネント: PascalCase (`Button.tsx`, `Header.tsx`)
- ユーティリティ: camelCase (`utils.ts`, `firebase.ts`)
- 型定義: `index.ts` または対象のファイル名

### コミットメッセージ

```
<type>: <概要>

<詳細説明（必要な場合）>
```

**type の種類:**
- `feat`: 新しい機能
- `fix`: バグの修正
- `docs`: ドキュメントのみの変更
- `style`: フォーマット変更（コードの動作に影響しない）
- `refactor`: リファクタリング
- `perf`: パフォーマンス向上
- `test`: テスト関連
- `chore`: ビルド、補助ツール関連

---

## 🔗 参考リンク

### GCP / Firebase
- [GCP Console](https://console.cloud.google.com/home/dashboard?project=sincere-kit)
- [Firebase Console](https://console.firebase.google.com/project/sincere-kit)
- [Cloud Build 履歴](https://console.cloud.google.com/cloud-build/builds?project=sincere-kit)
- [Cloud Run サービス](https://console.cloud.google.com/run?project=sincere-kit)

### ドキュメント
- [React 18 ドキュメント](https://react.dev/)
- [Vite ドキュメント](https://vitejs.dev/)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [Firebase ドキュメント](https://firebase.google.com/docs)
