# =============================================================================
# Cloud Build - CI/CD パイプライン
# =============================================================================
#
# このファイルには Cloud Build に関連するすべてのリソースが含まれます:
#   - サービスアカウント
#   - IAMバインディング
#   - Artifact Registry
#   - Cloud Buildトリガー
#
# =============================================================================

# -----------------------------------------------------------------------------
# Service Account
# -----------------------------------------------------------------------------

resource "google_service_account" "cloud_build" {
  account_id   = "buzzbase-cloudbuild"
  display_name = "BuzzBase Cloud Build Service Account"
}

# -----------------------------------------------------------------------------
# IAM Bindings
# -----------------------------------------------------------------------------

# Artifact Registry への push 権限
resource "google_project_iam_member" "cloudbuild_artifact_registry" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

# Cloud Run デプロイ権限
resource "google_project_iam_member" "cloudbuild_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

# Service Account 使用権限
resource "google_project_iam_member" "cloudbuild_service_account_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

# ログ書き込み権限
resource "google_project_iam_member" "cloudbuild_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

# -----------------------------------------------------------------------------
# Artifact Registry
# -----------------------------------------------------------------------------

resource "google_artifact_registry_repository" "buzzbase" {
  location      = var.region
  repository_id = "buzzbase"
  description   = "BuzzBase Docker images"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Cloud Build Trigger (GitHub連携 - 第1世代)
# -----------------------------------------------------------------------------

resource "google_cloudbuild_trigger" "main_branch" {
  name        = "buzzbase-deploy-main"
  description = "Main ブランチへの push で自動デプロイ"
  location    = var.region

  # 第1世代のGitHub接続
  github {
    owner = var.github_owner
    name  = var.github_repo

    push {
      branch = "^main$"
    }
  }

  # terraformディレクトリのみの変更ではビルドをスキップ
  ignored_files = [
    "terraform/**",
    "docs/**",
    "*.md",
    ".gitignore",
    ".cursorignore",
    ".cursor/**",
  ]

  filename = "cloudbuild.yaml"

  substitutions = {
    _FIREBASE_API_KEY             = var.firebase_api_key
    _FIREBASE_MESSAGING_SENDER_ID = var.firebase_messaging_sender_id
    _FIREBASE_APP_ID              = var.firebase_app_id
  }

  service_account = "projects/${var.project_id}/serviceAccounts/${google_service_account.cloud_build.email}"

  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Cloud Build Trigger (審査用環境 - meta-review-englishブランチ)
# -----------------------------------------------------------------------------

resource "google_cloudbuild_trigger" "review_branch" {
  name        = "buzzbase-deploy-review"
  description = "Meta審査用環境: meta-review-english ブランチへの push で自動デプロイ"
  location    = var.region

  # 第1世代のGitHub接続
  github {
    owner = var.github_owner
    name  = var.github_repo

    push {
      branch = "^meta-review-english$"
    }
  }

  # terraformディレクトリのみの変更ではビルドをスキップ
  ignored_files = [
    "terraform/**",
    "docs/**",
    "*.md",
    ".gitignore",
    ".cursorignore",
    ".cursor/**",
  ]

  filename = "cloudbuild.yaml"

  substitutions = {
    _FIREBASE_API_KEY             = var.firebase_api_key
    _FIREBASE_MESSAGING_SENDER_ID = var.firebase_messaging_sender_id
    _FIREBASE_APP_ID              = var.firebase_app_id
    _SERVICE_NAME                 = "buzzbase-review"  # 審査用環境のサービス名
  }

  service_account = "projects/${var.project_id}/serviceAccounts/${google_service_account.cloud_build.email}"

  depends_on = [google_project_service.required_apis]
}

