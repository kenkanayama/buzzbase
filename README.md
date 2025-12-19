# 🚀 BuzzBase（バズベース）

インフルエンサー向け「再生数補償型サンプリング」支援Webアプリ

## 📋 概要

BuzzBaseは、インフルエンサーが商品PR投稿のURLを登録し、7日後の再生数を自動取得・可視化するWebアプリケーションです。

### 主な機能
- 🔐 Firebase認証（Google / メールリンク）
- 📊 投稿再生数の自動トラッキング
- 📱 スマホファースト・レスポンシブデザイン
- 🔗 Instagram / TikTok連携

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Hosting | Cloud Run (Docker) |
| Batch | Cloud Scheduler + Cloud Functions |
| IaC | Terraform |
| CI/CD | GitHub + Cloud Build |

## 📁 プロジェクト構成

```
buzz_base/
├── terraform/          # GCPインフラ定義
├── frontend/           # Vite + React アプリ
│   ├── src/
│   │   ├── components/ # UIコンポーネント
│   │   ├── contexts/   # React Context
│   │   ├── hooks/      # カスタムフック
│   │   ├── lib/        # ユーティリティ
│   │   ├── pages/      # ページコンポーネント
│   │   └── types/      # 型定義
│   └── public/         # 静的ファイル
├── firebase/           # Firestore ルール/インデックス
├── functions/          # Cloud Functions (後で追加)
├── Dockerfile          # 本番用
├── Dockerfile.dev      # 開発用
└── docker-compose.yml  # ローカル開発環境
```

## 🚀 開発環境のセットアップ

### 前提条件

- Node.js 20+
- Docker & Docker Compose
- GCP アカウント（本番デプロイ時）
- Firebase プロジェクト

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd buzz_base
```

### 2. 環境変数の設定

```bash
# 環境変数ファイルをコピー
cp env.example .env

# .env ファイルを編集し、Firebase の設定を入力
```

### 3. フロントエンド依存関係のインストール

```bash
cd frontend
npm install
```

### 4. 開発サーバーの起動

#### 方法A: Docker を使用（推奨）
```bash
# プロジェクトルートで実行
docker compose up
```

#### 方法B: ローカルで直接実行
```bash
cd frontend
npm run dev
```

開発サーバーが `http://localhost:5173` で起動します。

### 5. Firebase Emulator の使用（オプション）

ローカルでFirestoreとAuthをテストする場合：

```bash
docker compose --profile emulator up
```

Firebase Emulator UI: `http://localhost:4000`

## 🏗️ GCP インフラのデプロイ

### 1. Terraform の設定

```bash
cd terraform

# 変数ファイルをコピー
cp terraform.tfvars.example terraform.tfvars

# terraform.tfvars を編集し、プロジェクトIDを設定
```

### 2. インフラのデプロイ

```bash
# 初期化
terraform init

# プラン確認
terraform plan

# デプロイ
terraform apply
```

## 📝 開発ステップ

指示書に従い、以下の順序で開発を進めます：

1. ✅ **Infrastructure** - Terraform による GCP 基盤構築
2. ✅ **Dev Environment** - Docker / Vite + React 初期構築
3. ⬜ **CI/CD** - Cloud Build 設定
4. ⬜ **Authentication** - Firebase Auth + Resend 連携
5. ⬜ **Frontend & DB** - ダッシュボード UI と Firestore CRUD
6. ⬜ **Backend Logic** - Cloud Functions（再生数取得バッチ）
7. ⬜ **SNS API** - Instagram / TikTok API 連携

## 🧪 テスト

```bash
cd frontend

# 型チェック
npm run type-check

# リント
npm run lint
```

## 📦 ビルド

```bash
cd frontend
npm run build
```

ビルド成果物は `frontend/dist/` に出力されます。

## 🐳 Docker イメージのビルド

```bash
# 本番用イメージのビルド
docker build -t buzzbase:latest .
```

## 📄 ライセンス

Private - All Rights Reserved

---

Built with ❤️ for Influencers

