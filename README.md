# 🚀 BuzzBase（バズベース）

インフルエンサー向け「再生数補償型サンプリング」支援Webアプリ

## 📋 概要

BuzzBaseは、インフルエンサーが商品PR投稿のURLを登録し、7日間のインサイトデータを自動取得・可視化するWebアプリケーションです。

### 主な機能

- 🔐 **認証**: Firebase Authentication（Google / メールパスワード）
- 📱 **SNS連携**: Instagram OAuth連携（プロフィール画像・投稿一覧取得）
- 📊 **投稿管理**: PR投稿の登録・一覧表示・インサイトデータ可視化
- ⏰ **自動データ取得**: 投稿から7日目まで毎日インサイトデータを自動取得（Cloud Scheduler + Cloud Functions）
- 📱 **スマホファースト**: レスポンシブデザイン

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication |
| Database | Cloud Firestore（名前付きデータベース） |
| Hosting | Cloud Run (Docker) |
| Batch | Cloud Scheduler + Pub/Sub + Cloud Functions |
| Storage | Cloud Storage（プロフィール画像・サムネイル） |
| IaC | Terraform |
| CI/CD | GitHub + Cloud Build |

## 📁 プロジェクト構成

```
buzz_base/
├── docs/                   # ドキュメント
│   ├── DEVELOPMENT.md      # 開発ガイド
│   ├── DEVELOPMENT_ROADMAP.md  # 開発ロードマップ
│   ├── DESIGN_SYSTEM.md    # デザインシステムガイドライン
│   ├── SETUP_CICD.md       # CI/CD セットアップ
│   ├── API_RESOURCES.md    # RESTful APIリソース設計
│   └── DASHBOARD_TODO.md   # ダッシュボード機能開発TODO
├── terraform/              # GCPインフラ定義
│   ├── main.tf             # Terraform設定、プロバイダー
│   ├── cloud_run.tf        # Cloud Run関連リソース
│   ├── cloud_functions.tf  # Cloud Functions関連リソース
│   ├── cloud_scheduler.tf  # Cloud Scheduler・Pub/Sub関連
│   ├── cloud_build.tf      # Cloud Build・Artifact Registry
│   ├── secrets.tf          # Secret Manager関連
│   ├── iam_local_dev.tf    # ローカル開発用SA・IAM
│   └── functions/          # Cloud Functionsソースコード
│       ├── index.js        # 関数実装
│       └── package.json
├── frontend/               # React アプリ
│   ├── src/
│   │   ├── components/     # UIコンポーネント
│   │   │   ├── auth/       # 認証関連
│   │   │   ├── layout/     # レイアウト
│   │   │   └── ui/         # 汎用UI
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # カスタムフック
│   │   ├── lib/            # ユーティリティ
│   │   │   ├── api/        # API連携
│   │   │   └── firestore/  # Firestoreアクセス
│   │   ├── pages/          # ページコンポーネント
│   │   ├── styles/         # グローバルスタイル
│   │   └── types/          # 型定義
│   └── public/             # 静的ファイル
├── firebase/               # Firestore ルール/インデックス
├── cloudbuild.yaml         # CI/CD 設定
├── Dockerfile              # 本番用
├── Dockerfile.dev          # 開発用
└── docker-compose.yml      # ローカル開発環境
```

## 🚀 開発環境のセットアップ

### 前提条件

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

### インフラ・基盤

1. ✅ **Infrastructure** - Terraform による GCP 基盤構築
2. ✅ **Dev Environment** - Docker / Vite + React 初期構築
3. ✅ **CI/CD** - Cloud Build + GitHub 連携

### 機能開発

4. ✅ **Authentication** - Firebase Authentication（Google / メールパスワード）
5. ✅ **Frontend & DB** - ダッシュボード UI と Firestore CRUD
6. ✅ **SNS連携** - Instagram OAuth連携（投稿取得・プロフィール画像保存）
7. ✅ **Backend Logic** - Cloud Functions（インサイトデータ取得バッチ）

### UI/UX改善

8. ✅ **Phase 1** - デザイン統一
9. ✅ **Phase 2** - データ未存在時のUI対応
10. ✅ **Phase 3** - SNSアカウント未連携時の制御
11. ✅ **Phase 4** - PR投稿登録フロー改善

### 残りの開発項目

12. ⬜ **Phase 5** - 投稿一覧フィルタリング機能（7日以内の投稿のみ表示）
13. ⬜ **Phase 6** - Instagramアクセストークン自動更新機能
14. ⬜ **TikTok連携** - TikTok API 連携

詳細は [docs/DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) を参照してください。

## 🔧 Cloud Functions

現在実装済みのCloud Functions：

| 関数名 | トリガー | 説明 |
|--------|----------|------|
| `instagramCallback` | HTTP | Instagram OAuth コールバック処理 |
| `getInstagramMedia` | HTTP | Instagram投稿一覧を取得（認証必須） |
| `saveThumbnailToStorage` | HTTP | 投稿サムネイル画像をCloud Storageに保存 |
| `fetchPostInsights` | Pub/Sub | PR投稿のインサイトデータを自動取得（毎日23:00 JST） |

### バッチ処理（インサイトデータ取得）

- **実行時刻**: 毎日 23:00 JST
- **対象投稿**: 投稿日（JST基準）から1〜7日目に該当する投稿
- **データ取得タイミング**:
  - 0日目（登録時）: 即座に取得
  - 1〜7日目: バッチで毎日取得（最大8回）
  - 7日目のバッチ処理後にステータスを 'measured' に変更
- **処理フロー**: Cloud Scheduler → Pub/Sub → Cloud Functions（再帰的に1件ずつ処理）
- **取得データ**: リーチ、保存数、再生数、いいね数、コメント数、平均視聴時間 など

## 🧪 テスト・ビルド

```bash
# Docker 環境内で実行
docker compose exec frontend npm run type-check  # 型チェック
docker compose exec frontend npm run lint        # リント
docker compose exec frontend npm run build       # ビルド
```

## 🏗️ GCP インフラのデプロイ

```bash
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
| [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) | 開発ロードマップ・今後の実装予定 |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | UI/UX デザインガイドライン |
| [SETUP_CICD.md](docs/SETUP_CICD.md) | GitHub + Cloud Build 連携手順 |
| [API_RESOURCES.md](docs/API_RESOURCES.md) | RESTful APIリソース設計 |
| [DASHBOARD_TODO.md](docs/DASHBOARD_TODO.md) | ダッシュボード機能開発TODO |
| [アプリ開発概要.md](アプリ開発概要.md) | 機能要件・仕様書 |

## ⚠️ 既知の制限事項

- **Instagramアクセストークン**: 60日で有効期限切れとなります。現在、自動更新機能（Phase 6）は未実装のため、期限切れ時は再連携が必要です。
- **TikTok連携**: 現在未実装。Instagram連携のみ対応しています。

## 📄 ライセンス

Private - All Rights Reserved

---

Built with ❤️ for Influencers
