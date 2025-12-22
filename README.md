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
├── docs/               # ドキュメント
│   ├── DEVELOPMENT.md  # 開発ガイド
│   └── SETUP_CICD.md   # CI/CD セットアップ
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
├── cloudbuild.yaml     # CI/CD 設定
├── Dockerfile          # 本番用
├── Dockerfile.dev      # 開発用
└── docker-compose.yml  # ローカル開発環境
```

## 🚀 開発環境のセットアップ

### 前提条件

- Node.js 20+
- Docker & Docker Compose
- GCP アカウント（本番デプロイ時）
- Firebase プロジェクト（`sincere-kit`）

### クイックスタート

```bash
# 1. 環境変数を設定
cp env.example .env
# .env を編集して Firebase 設定を入力

# 2. 開発サーバーを起動
docker compose up frontend

# 3. ブラウザでアクセス
# http://localhost:5173
```

詳細は [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) を参照してください。

## 📝 開発ステップ

指示書に従い、以下の順序で開発を進めています：

1. ✅ **Infrastructure** - Terraform による GCP 基盤構築
2. ✅ **Dev Environment** - Docker / Vite + React 初期構築
3. ✅ **CI/CD** - Cloud Build + GitHub 連携
4. ✅ **Authentication** - Firebase Authentication
5. 🔄 **Frontend & DB** - ダッシュボード UI と Firestore CRUD
6. ⬜ **Backend Logic** - Cloud Functions（再生数取得バッチ）
7. ⬜ **SNS API** - Instagram / TikTok API 連携

## 🧪 テスト・ビルド

```bash
# Docker 環境内で実行
docker compose exec frontend npm run type-check  # 型チェック
docker compose exec frontend npm run lint        # リント
docker compose exec frontend npm run build       # ビルド
```

## 🏗️ GCP インフラのデプロイ

```bash
cd terraform

# Terraform 初期化
docker compose --profile terraform run --rm terraform init

# プラン確認
docker compose --profile terraform run --rm terraform plan

# デプロイ
docker compose --profile terraform run --rm terraform apply
```

## 📚 ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | 開発環境セットアップ・開発フロー |
| [SETUP_CICD.md](docs/SETUP_CICD.md) | GitHub + Cloud Build 連携手順（完了済み） |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | UI/UX デザインガイドライン |
| [DASHBOARD_TODO.md](docs/DASHBOARD_TODO.md) | ダッシュボード機能開発TODO |
| [API_RESOURCES.md](docs/API_RESOURCES.md) | RESTful APIリソース設計 |
| [アプリ開発概要.md](アプリ開発概要.md) | 機能要件・仕様書 |

## 📄 ライセンス

Private - All Rights Reserved

---

Built with ❤️ for Influencers
