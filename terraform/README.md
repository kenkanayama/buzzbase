# Terraform - BuzzBase インフラ管理

このディレクトリには、BuzzBaseプロジェクトのGCPインフラストラクチャを定義するTerraformファイルが含まれています。

## 📁 ディレクトリ構成

```
terraform/
├── main.tf                    # Terraformブロック、プロバイダー設定、API有効化
├── variables.tf               # 変数定義
├── outputs.tf                # 出力定義
├── cloud_run.tf              # Cloud Run関連リソース
├── cloud_functions.tf        # Cloud Functions関連リソース
├── cloud_build.tf            # Cloud Build・Artifact Registry関連リソース
├── cloud_scheduler.tf        # Cloud Scheduler・Pub/Sub関連リソース
├── secrets.tf                # Secret Manager関連リソース
├── iam_local_dev.tf         # ローカル開発用サービスアカウント
├── terraform.tfvars          # 変数値（.gitignoreに含む）
├── terraform.tfvars.example  # 変数値のサンプル
└── functions/                # Cloud Functionsソースコード
    ├── index.js
    └── package.json
```

## 📄 ファイル説明

### `main.tf`
- Terraformブロック（バージョン、プロバイダー設定）
- Google Cloud Provider設定
- 必要なGCP APIの有効化

### `variables.tf`
- プロジェクトID、リージョン、環境名などの変数定義
- Firebase設定変数
- GitHub設定変数
- フロントエンドURL設定

### `outputs.tf`
- Cloud Run URL
- Cloud Functions URL（Instagram OAuth Callback、投稿取得API）
- サービスアカウント情報
- Artifact Registryリポジトリ情報

### `cloud_run.tf`
Cloud Runに関連するすべてのリソース：
- サービスアカウント（`buzzbase-cloudrun`）
- IAMバインディング（Firestoreアクセス権限）
- Cloud Runサービス（フロントエンドアプリケーション）
- 公開アクセス設定

### `cloud_functions.tf`
Cloud Functionsに関連するすべてのリソース：
- サービスアカウント（`buzzbase-functions`）
- IAMバインディング（Firestore、Secret Manager、Cloud Storageアクセス権限）
- Cloud Storageバケット（ソースコード、プロフィール画像、投稿サムネイル）
- Cloud Functions:
  - `instagramCallback`: Instagram OAuthコールバック処理
  - `getInstagramMedia`: Instagram投稿一覧取得（認証必須）
  - `saveThumbnailToStorage`: 投稿サムネイル画像保存
- 公開アクセス設定

### `cloud_build.tf`
Cloud Buildに関連するすべてのリソース：
- サービスアカウント（`buzzbase-cloudbuild`）
- IAMバインディング（Artifact Registry、Cloud Runデプロイ権限）
- Artifact Registryリポジトリ（Dockerイメージ保存用）
- Cloud Buildトリガー（GitHub連携、mainブランチへのpushで自動デプロイ）

### `cloud_scheduler.tf`
Cloud Scheduler・Pub/Subに関連するリソース：
- Pub/Subトピック・サブスクリプション（`fetch-post-insights`）
- Cloud Scheduler（毎日23:00 JSTに実行）
- Cloud Function（`fetchPostInsights`: PR投稿インサイトデータ取得バッチ）
- IAMバインディング（Pub/Subパブリッシュ権限）

### `secrets.tf`
Secret Managerに関連するリソース：
- Firebase設定シークレット（API Key、App ID、Messaging Sender ID）
- Meta App (Instagram) シークレット（App Secret）

**注意**: シークレットの値はTerraformで管理せず、GCP Consoleまたはgcloud CLIで設定してください。

### `iam_local_dev.tf`
ローカル開発・Terraform実行用のサービスアカウント：
- サービスアカウント（`ken-kanayama`）
- IAMバインディング（Editor、Cloud Functions Admin、IAM Admin権限）

### `functions/`
Cloud Functionsのソースコード：
- `index.js`: すべてのCloud Functionsのエントリーポイント
- `package.json`: Node.js依存関係

## 🚀 使用方法

### 1. 初期設定

#### 変数ファイルの作成
```bash
cp terraform.tfvars.example terraform.tfvars
```

#### 変数の設定
`terraform.tfvars` を編集して、必要な変数を設定してください：

```hcl
project_id = "sincere-kit"
region = "asia-northeast1"
firestore_location = "asia-northeast1"
environment = "dev"

# Firebase設定
firebase_api_key = "your-firebase-api-key"
firebase_messaging_sender_id = "your-sender-id"
firebase_app_id = "your-app-id"

# GitHub設定
github_owner = "your-github-owner"
github_repo = "your-repo-name"

# フロントエンドURL
frontend_url = "https://your-frontend-url.run.app"
```

### 2. Terraformコマンドの実行

#### Docker環境での実行（推奨）
```bash
# 初期化
docker compose --profile terraform run --rm terraform init

# プランの確認
docker compose --profile terraform run --rm terraform plan

# 適用
docker compose --profile terraform run --rm terraform apply
```

#### ローカル環境での実行
```bash
# 初期化
terraform init

# プランの確認
terraform plan

# 適用
terraform apply
```

### 3. シークレットの設定

Terraformでシークレットリソースを作成した後、GCP Consoleまたはgcloud CLIで値を設定してください：

```bash
# Firebase API Key
echo -n "your-api-key" | gcloud secrets versions add firebase-api-key --data-file=-

# Firebase App ID
echo -n "your-app-id" | gcloud secrets versions add firebase-app-id --data-file=-

# Firebase Messaging Sender ID
echo -n "your-sender-id" | gcloud secrets versions add firebase-messaging-sender-id --data-file=-

# Meta Instagram App Secret
echo -n "your-app-secret" | gcloud secrets versions add meta-instagram-app-secret --data-file=-
```

## 🏗️ 主要なリソース

### Cloud Run
- **サービス名**: `buzzbase`
- **リージョン**: `asia-northeast1`
- **イメージ**: Artifact Registryから取得（`latest`タグ）
- **公開アクセス**: 有効（未認証ユーザーもアクセス可能）

### Cloud Functions
- **instagramCallback**: Instagram OAuthコールバック処理（公開API）
- **getInstagramMedia**: Instagram投稿一覧取得（認証必須）
- **saveThumbnailToStorage**: 投稿サムネイル画像保存（認証必須）
- **fetchPostInsights**: PR投稿インサイトデータ取得バッチ（Pub/Subトリガー）

### Cloud Build
- **トリガー名**: `buzzbase-deploy-main`
- **トリガー条件**: `main`ブランチへのpush
- **ビルド設定**: `cloudbuild.yaml`を使用
- **無視ファイル**: `terraform/**`, `docs/**`, `*.md`など

### Cloud Scheduler
- **ジョブ名**: `fetch-post-insights-scheduler`
- **スケジュール**: 毎日23:00 JST（`0 23 * * *`）
- **処理内容**: PR投稿のインサイトデータ取得をトリガー

### Artifact Registry
- **リポジトリ名**: `buzzbase`
- **フォーマット**: Docker
- **リージョン**: `asia-northeast1`

### Cloud Storage
- **functions-bucket**: Cloud Functionsソースコード格納用（`{project_id}-functions`）
- **profile-images**: プロフィール画像保存用（`{project_id}-profile-images`）
- **post-thumbnails**: 投稿サムネイル保存用（`sincere-kit-post-thumbnails`）

## ⚠️ 注意事項

### 1. シークレットの管理
- シークレットの値はTerraformで管理せず、GCP Consoleまたはgcloud CLIで設定してください
- `terraform.tfvars`には機密情報を含めないでください（`.gitignore`に含まれています）

### 2. バックエンド設定
- 現在はローカルバックエンドを使用しています
- 本番環境ではGCSバックエンドの使用を推奨します（`main.tf`のコメントを参照）

### 3. ライフサイクル設定
- Cloud Runサービスのイメージは`lifecycle.ignore_changes`で無視されています
- イメージの更新はCloud Buildトリガーで自動的に行われます

### 4. ファイル構成の原則
- 各GCPサービスに関連するすべてのリソース（サービスアカウント、IAM、サービス本体）を1ファイルにまとめています
- これにより保守性が向上し、特定サービスの変更時に1ファイルだけ編集すればよい

### 5. IAMリソースの配置
- サービス固有のサービスアカウント・IAM → そのサービスのファイル（例: `cloud_run.tf`）
- 複数サービスで共有するサービスアカウント・IAM → 専用ファイル（例: `iam_local_dev.tf`）

## 📚 関連ドキュメント

- [GCP手動設定ガイド](../docs/GCP_MANUAL_CONFIGURATION.md)
- [CI/CDセットアップガイド](../docs/SETUP_CICD.md)
- [プロジェクト設定](../docs/PROJECT_CONFIG.md)

## 🔧 トラブルシューティング

### Terraformプランでエラーが発生する場合
1. 必要なGCP APIが有効になっているか確認
2. サービスアカウントに適切な権限があるか確認
3. 変数が正しく設定されているか確認（`terraform.tfvars`）

### Cloud Functionsのデプロイが失敗する場合
1. `functions/`ディレクトリのソースコードを確認
2. `package.json`の依存関係を確認
3. Cloud StorageバケットにZIPファイルが正しくアップロードされているか確認

### Cloud Buildトリガーが動作しない場合
1. GitHub連携が正しく設定されているか確認
2. トリガーのブランチ設定を確認
3. `cloudbuild.yaml`のパスが正しいか確認

