# 🔧 GCP 手動設定ガイド（Terraform管理外）

> このドキュメントは、Terraformで管理できないGCPおよび関連サービスの設定内容を記載しています。
> 新規環境のセットアップや設定の復元時に参照してください。

---

## 📋 概要

BuzzBaseのインフラは可能な限りTerraformで管理されていますが、以下の設定は技術的な制約やセキュリティ上の理由からTerraform管理外となっています。

### Terraform管理対象

| カテゴリ | リソース | 管理ファイル |
|----------|----------|--------------|
| Cloud Run | サービス、SA、IAM | `cloud_run.tf` |
| Cloud Build | トリガー、SA、IAM | `cloud_build.tf` |
| Cloud Functions | 関数（4件）、SA、IAM | `cloud_functions.tf` |
| Cloud Scheduler | ジョブ | `cloud_scheduler.tf` |
| Pub/Sub | トピック、サブスクリプション | `cloud_scheduler.tf` |
| Artifact Registry | リポジトリ | `cloud_build.tf` |
| Secret Manager | シークレット（存在のみ） | `secrets.tf` |
| Cloud Storage | バケット（3件） | `cloud_functions.tf` |
| IAM | サービスアカウント、ロールバインディング | 各 `.tf` ファイル |

### Terraform管理外

| カテゴリ | 設定内容 | 設定場所 |
|----------|----------|----------|
| Firebase Authentication | 認証プロバイダー設定 | Firebase Console |
| Cloud Firestore | データベース作成 | Firebase Console |
| Firestore Security Rules | アクセス制御ルール | Firebase Console / CLI |
| Cloud Build GitHub連携 | OAuth App接続 | GCP Console |
| Secret Managerの値 | シークレットのバージョン | gcloud CLI |
| Meta App (Instagram) | OAuth設定、コールバックURL | Meta Developer Console |
| Firebase初期設定 | プロジェクト作成・初期化 | Firebase Console |

---

## 🔥 Firebase 設定

### 1. Firebase Authentication

#### 設定場所
[Firebase Console](https://console.firebase.google.com/project/sincere-kit/authentication/providers)

#### 有効化済みプロバイダー

| プロバイダー | ステータス | 備考 |
|--------------|------------|------|
| メール/パスワード | ✅ 有効 | - |
| Google | ✅ 有効 | - |
| メールリンク | ⬜ 未実装 | 将来的に実装予定 |

#### 設定手順（新規環境）

1. Firebase Console にアクセス
2. 「Authentication」→「Sign-in method」タブを選択
3. 「メール/パスワード」を有効化
4. 「Google」を有効化し、サポートメールを設定

### 2. Cloud Firestore

#### 設定場所
[Firebase Console](https://console.firebase.google.com/project/sincere-kit/firestore)

#### 現在の設定

| 項目 | 値 |
|------|-----|
| データベースID | `sincere-kit-buzzbase` |
| ロケーション | `asia-northeast1` (東京) |
| モード | ネイティブモード |

#### 設定手順（新規環境）

```bash
# Firebase CLI を使用する場合
firebase firestore:databases:create sincere-kit-buzzbase \
  --location=asia-northeast1 \
  --project=sincere-kit
```

または Firebase Console から：
1. Firestore Database にアクセス
2. 「データベースを作成」をクリック
3. ロケーション「asia-northeast1」を選択
4. 本番モードで開始

### 3. Firestore Security Rules

#### 設定場所
- ソースファイル: `firebase/firestore.rules`
- [Firebase Console](https://console.firebase.google.com/project/sincere-kit/firestore/rules)

#### 現在のルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ユーザープロフィール
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Instagramアカウントトークン（Cloud Functions経由のみアクセス可能）
    match /instagramAccounts/{accountId} {
      allow read: if false;
      allow write: if false;
    }
    
    // キャンペーン（認証済みユーザーは読み取り可能）
    match /campaigns/{campaignId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null
        && request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['postedMedia', 'updatedAt']);
      allow create, delete: if false;
    }
    
    // PR投稿データ
    match /prPosts/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
  }
}
```

#### デプロイ手順

```bash
# Firebase CLI を使用
firebase deploy --only firestore:rules --project=sincere-kit

# または Firebase Console から直接編集
```

---

## 🔑 Secret Manager シークレット値

### 設定場所
gcloud CLI または [GCP Console](https://console.cloud.google.com/security/secret-manager?project=sincere-kit)

### 管理対象シークレット

Terraformでは**シークレットの存在のみ**を管理しています。値は手動で設定が必要です。

| シークレットID | 用途 | 設定元 | Terraform管理 |
|----------------|------|--------|---------------|
| `firebase-api-key` | Firebase API Key | Firebase Console | ✅ |
| `firebase-app-id` | Firebase App ID | Firebase Console | ✅ |
| `firebase-messaging-sender-id` | FCM Sender ID | Firebase Console | ✅ |
| `meta-instagram-app-secret` | Meta App Client Secret | Meta Developer Console | ✅ |

### 値の設定手順

```bash
# 新しいバージョンを追加
echo -n "YOUR_SECRET_VALUE" | \
  gcloud secrets versions add firebase-api-key --data-file=-

# 現在の値を確認（※注意: 機密情報）
gcloud secrets versions access latest --secret=firebase-api-key
```

---

## 🔗 Cloud Build GitHub 連携

### 設定場所
[GCP Console - Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers?project=sincere-kit)

### 現在の設定

| 項目 | 値 |
|------|-----|
| リポジトリ | `kenkanayama/buzzbase` |
| トリガー名 | `buzzbase-deploy-main` |
| トリガーブランチ | `^main$` |
| ビルド設定ファイル | `cloudbuild.yaml` |

### 設定手順（新規環境）

1. [GCP Console - Cloud Build](https://console.cloud.google.com/cloud-build/triggers) にアクセス
2. 「トリガー」→「リポジトリを接続」をクリック
3. 「GitHub (Cloud Build GitHub アプリ)」を選択
4. GitHub で認証し、対象リポジトリへのアクセスを許可
5. リポジトリ `kenkanayama/buzzbase` を選択

> ⚠️ **注意**: GitHub OAuth 連携は GCP Console からの手動設定が必要です。
> Terraformでビルドトリガーは管理していますが、リポジトリ接続自体は手動で行う必要があります。

---

## 📱 Meta App (Instagram/Facebook)

### 設定場所
[Meta Developer Console](https://developers.facebook.com/apps/)

### 現在の設定

| 項目 | 値 |
|------|-----|
| App ID | `538301619140929` |
| App Name | BuzzBase |
| 有効なプロダクト | Instagram Basic Display API |

### OAuth コールバックURL

以下のURLをMeta App Dashboardの「Valid OAuth Redirect URIs」に登録：

```
https://asia-northeast1-sincere-kit.cloudfunctions.net/instagramCallback
```

### 必要な権限

| 権限 | 用途 |
|------|------|
| `instagram_basic` | 基本プロフィール情報 |
| `instagram_content_publish` | 投稿データ取得 |
| `instagram_manage_insights` | インサイトデータ取得 |
| `pages_read_engagement` | ページエンゲージメント |

### 設定手順（新規環境）

1. [Meta Developer Console](https://developers.facebook.com/apps/) にアクセス
2. 新しいアプリを作成（ビジネスタイプ）
3. 「Instagram Basic Display」を追加
4. OAuth設定:
   - Deauthorize Callback URL: 任意
   - Data Deletion Request URL: 任意
   - Valid OAuth Redirect URIs: 上記コールバックURLを追加
5. Client ID と Client Secret を取得
6. Secret Manager に値を保存

---

## 🗃️ GCPプロジェクト初期設定

### プロジェクト情報

| 項目 | 値 |
|------|-----|
| プロジェクトID | `sincere-kit` |
| プロジェクト番号 | `1028492470102` |
| リージョン | `asia-northeast1` |

### 請求先アカウント

請求先アカウントはGCP Console から手動で設定が必要です。
[GCP Console - 請求](https://console.cloud.google.com/billing?project=sincere-kit)

---

## 📝 チェックリスト（新規環境セットアップ）

### 1. GCP プロジェクト
- [ ] プロジェクト作成
- [ ] 請求先アカウント紐付け

### 2. Terraform 適用
```bash
docker compose --profile terraform run --rm terraform init
docker compose --profile terraform run --rm terraform plan
docker compose --profile terraform run --rm terraform apply
```

### 3. Firebase 設定
- [ ] Firebase プロジェクト初期化
- [ ] Authentication プロバイダー設定
- [ ] Firestore データベース作成
- [ ] Security Rules デプロイ

### 4. Secret Manager
- [ ] `firebase-api-key` の値を設定
- [ ] `firebase-app-id` の値を設定
- [ ] `firebase-messaging-sender-id` の値を設定
- [ ] `instagram-client-id` の値を設定（Meta App設定後）
- [ ] `instagram-client-secret` の値を設定（Meta App設定後）

### 5. Cloud Build GitHub 連携
- [ ] GitHub リポジトリ接続
- [ ] ビルドトリガー確認

### 6. Meta App 設定
- [ ] Meta Developer アプリ作成
- [ ] Instagram Basic Display API 有効化
- [ ] OAuth コールバックURL設定
- [ ] Client ID/Secret を Secret Manager に保存

---

## 📚 関連ドキュメント

- [CI/CD セットアップガイド](./SETUP_CICD.md)
- [プロジェクト設定情報](./PROJECT_CONFIG.md)
- [開発ロードマップ](./DEVELOPMENT_ROADMAP.md)
- [API リソース一覧](./API_RESOURCES.md)

---

*最終更新: 2025-12-24*

