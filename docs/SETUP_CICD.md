# 🚀 BuzzBase CI/CD セットアップガイド

このガイドでは、GitHub と GCP Cloud Build を連携して自動デプロイを設定する手順を説明します。

## 📋 前提条件

- [x] GCP プロジェクト作成済み（`sincere-kit`）
- [x] Firebase Authentication 有効化済み
- [ ] GitHub リポジトリ作成済み
- [ ] Terraform でインフラ構築済み

## 🔧 セットアップ手順

### Step 1: GitHub リポジトリの作成

```bash
# リポジトリ初期化（まだの場合）
cd /path/to/buzz_base
git init

# リモートリポジトリを追加
git remote add origin https://github.com/kenkanayama/buzzbase.git

# 初回コミット
git add .
git commit -m "Initial commit: BuzzBase project setup"
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
  secretmanager.googleapis.com
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

### Step 6: Secret Manager に Firebase 設定を保存

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
| `_FIREBASE_API_KEY` | `$$SECRET:firebase-api-key` または 直接値 |
| `_FIREBASE_MESSAGING_SENDER_ID` | `$$SECRET:firebase-messaging-sender-id` または 直接値 |
| `_FIREBASE_APP_ID` | `$$SECRET:firebase-app-id` または 直接値 |

4. 「作成」をクリック

### Step 8: 初回デプロイのテスト

```bash
# main ブランチに push してトリガー
git add .
git commit -m "Add CI/CD configuration"
git push origin main
```

[Cloud Build 履歴](https://console.cloud.google.com/cloud-build/builds?project=sincere-kit) でビルド状況を確認できます。

## ✅ 確認事項

- [ ] GitHub リポジトリが作成されている
- [ ] Cloud Build と GitHub が連携されている
- [ ] ビルドトリガーが作成されている
- [ ] main ブランチへの push で自動ビルドが開始される
- [ ] Cloud Run にデプロイされ、URLでアクセスできる

## 🔍 トラブルシューティング

### ビルドが失敗する場合

1. Cloud Build のログを確認
2. サービスアカウントの権限を確認
3. Artifact Registry リポジトリが存在するか確認

### デプロイが失敗する場合

1. Cloud Run サービスアカウントが存在するか確認
2. IAM 権限が正しく設定されているか確認

### 環境変数が反映されない場合

1. Secret Manager に正しい値が保存されているか確認
2. Cloud Build のログで変数が正しく渡されているか確認

## 📚 参考リンク

- [Cloud Build ドキュメント](https://cloud.google.com/build/docs)
- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [GitHub App の設定](https://cloud.google.com/build/docs/automating-builds/github/connect-repo-github)

