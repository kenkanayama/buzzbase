# 🚀 BuzzBase CI/CD セットアップガイド

このガイドでは、GitHub と GCP Cloud Build を連携して自動デプロイを設定する手順を説明します。

## 📋 前提条件

- [x] GCP プロジェクト作成済み（`sincere-kit`）
- [x] Firebase Authentication 有効化済み
- [ ] GitHub リポジトリ作成済み
- [ ] Terraform でインフラ構築済み

## 🔧 セットアップ手順

### Step 1: GitHub リポジトリの作成

> ⚠️ **重要**: リポジトリは先に GitHub 上で作成する必要があります

#### 1.1 GitHub でリポジトリを作成

1. [GitHub](https://github.com/new) にアクセス
2. 以下の設定で新規リポジトリを作成：
   - **Repository name**: `buzzbase`
   - **Description**: インフルエンサー向け再生数補償型サンプリング支援アプリ
   - **Visibility**: Private（推奨）または Public
   - **Initialize with**: 何も選択しない（空のリポジトリ）
3. 「Create repository」をクリック

#### 1.2 ローカルリポジトリの初期化とプッシュ

```bash
# プロジェクトディレクトリに移動
cd /Users/ken.kanayama/kenkanayama/adhoc/buzz_base

# Git リポジトリを初期化（まだの場合）
git init

# リモートリポジトリを追加
git remote add origin https://github.com/kenkanayama/buzzbase.git

# 全ファイルをステージング
git add .

# 初回コミット
git commit -m "feat: BuzzBase プロジェクト初期構築

- Terraform による GCP インフラ定義
- Docker / docker-compose.yml による開発環境
- Vite + React + Tailwind CSS フロントエンド
- Cloud Build による CI/CD 設定"

# main ブランチにプッシュ
git branch -M main
git push -u origin main
```

### Step 2: GCP APIs の有効化

Cloud Shell または ローカルの gcloud CLI で実行：

```bash
# プロジェクトを設定
gcloud config set project sincere-kit

# 必要な API を有効化
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com
```

### Step 3: Artifact Registry リポジトリの作成

```bash
# Docker リポジトリを作成
gcloud artifacts repositories create buzzbase \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="BuzzBase Docker images"
```

### Step 4: Cloud Build サービスアカウントに権限を付与

```bash
# プロジェクト番号を取得
PROJECT_NUMBER=$(gcloud projects describe sincere-kit --format='value(projectNumber)')

# Cloud Build サービスアカウントに Cloud Run 管理者権限を付与
gcloud projects add-iam-policy-binding sincere-kit \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# サービスアカウントユーザー権限を付与
gcloud projects add-iam-policy-binding sincere-kit \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Artifact Registry 書き込み権限を付与
gcloud projects add-iam-policy-binding sincere-kit \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

### Step 5: Cloud Run サービスアカウントの作成

```bash
# サービスアカウント作成
gcloud iam service-accounts create buzzbase-cloudrun \
  --display-name="BuzzBase Cloud Run Service Account"

# Firestore アクセス権限を付与
gcloud projects add-iam-policy-binding sincere-kit \
  --member="serviceAccount:buzzbase-cloudrun@sincere-kit.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

### Step 6: Secret Manager に Firebase 設定を保存（オプション）

> 💡 Firebase の設定値はビルドトリガーの代入変数で直接指定することも可能です

```bash
# Firebase API Key
echo -n "YOUR_FIREBASE_API_KEY" | \
  gcloud secrets create firebase-api-key --data-file=-

# Firebase Messaging Sender ID
echo -n "YOUR_MESSAGING_SENDER_ID" | \
  gcloud secrets create firebase-messaging-sender-id --data-file=-

# Firebase App ID
echo -n "YOUR_FIREBASE_APP_ID" | \
  gcloud secrets create firebase-app-id --data-file=-

# Cloud Build に Secret へのアクセス権限を付与
PROJECT_NUMBER=$(gcloud projects describe sincere-kit --format='value(projectNumber)')

gcloud secrets add-iam-policy-binding firebase-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-messaging-sender-id \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-app-id \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 7: GitHub と Cloud Build の連携

#### 7.1 Cloud Build GitHub App のインストール

1. [GCP Console - Cloud Build](https://console.cloud.google.com/cloud-build/triggers?project=sincere-kit) にアクセス
2. 「トリガー」→「リポジトリを接続」をクリック
3. 「GitHub (Cloud Build GitHub アプリ)」を選択
4. GitHub で認証し、リポジトリへのアクセスを許可
5. `kenkanayama/buzzbase` リポジトリを選択

#### 7.2 ビルドトリガーの作成

1. 「トリガーを作成」をクリック
2. 以下の設定を入力：

| 項目 | 値 |
|------|-----|
| **名前** | `buzzbase-deploy-main` |
| **説明** | Main ブランチへの push で自動デプロイ |
| **イベント** | ブランチへの push |
| **ソース** | `^main$` |
| **構成** | Cloud Build 構成ファイル |
| **ロケーション** | リポジトリ |
| **Cloud Build 構成ファイルの場所** | `cloudbuild.yaml` |

3. 「代入変数」セクションで以下を追加：

| 変数名 | 値 |
|--------|-----|
| `_FIREBASE_API_KEY` | Firebase API Key の値 |
| `_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID の値 |
| `_FIREBASE_APP_ID` | App ID の値 |

4. 「作成」をクリック

### Step 8: 初回デプロイのテスト

```bash
# 何か変更を加えて push
git add .
git commit -m "chore: CI/CD テスト"
git push origin main
```

[Cloud Build 履歴](https://console.cloud.google.com/cloud-build/builds?project=sincere-kit) でビルド状況を確認できます。

## ✅ 確認チェックリスト

- [ ] GitHub リポジトリ `kenkanayama/buzzbase` が作成されている
- [ ] ローカルからリポジトリに push できる
- [ ] Cloud Build と GitHub が連携されている
- [ ] ビルドトリガーが作成されている
- [ ] main ブランチへの push で自動ビルドが開始される
- [ ] Cloud Run にデプロイされ、URLでアクセスできる

## 🔍 トラブルシューティング

### `Repository not found` エラー

**原因**: GitHub にリポジトリが存在しない

**解決策**:
1. [GitHub](https://github.com/new) で `buzzbase` リポジトリを作成
2. リポジトリ作成後に再度 `git push` を実行

### 認証エラー

**原因**: GitHub の認証情報が正しく設定されていない

**解決策**:
```bash
# GitHub CLI でログイン
gh auth login

# または Personal Access Token を使用
git remote set-url origin https://<USERNAME>:<TOKEN>@github.com/kenkanayama/buzzbase.git
```

### ビルドが失敗する場合

1. Cloud Build のログを確認
2. サービスアカウントの権限を確認
3. Artifact Registry リポジトリが存在するか確認

### デプロイが失敗する場合

1. Cloud Run サービスアカウントが存在するか確認
2. IAM 権限が正しく設定されているか確認

### 環境変数が反映されない場合

1. ビルドトリガーの代入変数を確認
2. Cloud Build のログで変数が正しく渡されているか確認

## 📚 参考リンク

- [Cloud Build ドキュメント](https://cloud.google.com/build/docs)
- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [GitHub App の設定](https://cloud.google.com/build/docs/automating-builds/github/connect-repo-github)
- [GitHub リポジトリ作成](https://docs.github.com/ja/repositories/creating-and-managing-repositories/creating-a-new-repository)
