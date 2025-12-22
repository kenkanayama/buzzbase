# =============================================================================
# BuzzBase - GCP Infrastructure with Terraform
# =============================================================================

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # 本番環境ではGCSバックエンドを使用
  # backend "gcs" {
  #   bucket = "buzzbase-terraform-state"
  #   prefix = "terraform/state"
  # }
}

# -----------------------------------------------------------------------------
# Provider Configuration
# -----------------------------------------------------------------------------

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# -----------------------------------------------------------------------------
# Enable Required APIs
# -----------------------------------------------------------------------------

resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "firebase.googleapis.com",
    "identitytoolkit.googleapis.com",
    "cloudfunctions.googleapis.com",
    "storage.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

# -----------------------------------------------------------------------------
# Artifact Registry (Docker Images)
# -----------------------------------------------------------------------------

resource "google_artifact_registry_repository" "buzzbase" {
  location      = var.region
  repository_id = "buzzbase"
  description   = "BuzzBase Docker images"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Service Accounts
# -----------------------------------------------------------------------------

# Cloud Run 用 Service Account
resource "google_service_account" "cloud_run" {
  account_id   = "buzzbase-cloudrun"
  display_name = "BuzzBase Cloud Run Service Account"
}

# Cloud Build 用 Service Account
resource "google_service_account" "cloud_build" {
  account_id   = "buzzbase-cloudbuild"
  display_name = "BuzzBase Cloud Build Service Account"
}

# -----------------------------------------------------------------------------
# IAM Bindings
# -----------------------------------------------------------------------------

# Cloud Run Service Account - Firestore アクセス
resource "google_project_iam_member" "cloudrun_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Cloud Build Service Account - Artifact Registry への push
resource "google_project_iam_member" "cloudbuild_artifact_registry" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

# Cloud Build Service Account - Cloud Run デプロイ
resource "google_project_iam_member" "cloudbuild_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

# Cloud Build Service Account - Service Account 使用
resource "google_project_iam_member" "cloudbuild_service_account_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

# -----------------------------------------------------------------------------
# Cloud Run Service
# -----------------------------------------------------------------------------

resource "google_cloud_run_v2_service" "buzzbase" {
  name     = "buzzbase"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run.email

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/buzzbase/frontend:latest"

      ports {
        container_port = 80
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_project_service.required_apis,
    google_artifact_registry_repository.buzzbase
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }
}

# Cloud Run - 未認証ユーザーからのアクセスを許可
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.buzzbase.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# -----------------------------------------------------------------------------
# Secret Manager (Firebase設定の管理)
# -----------------------------------------------------------------------------

resource "google_secret_manager_secret" "firebase_api_key" {
  secret_id = "firebase-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret" "firebase_app_id" {
  secret_id = "firebase-app-id"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret" "firebase_messaging_sender_id" {
  secret_id = "firebase-messaging-sender-id"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Cloud Functions (Instagram OAuth Callback)
# -----------------------------------------------------------------------------

# Cloud Functionsソースコード格納用バケット
resource "google_storage_bucket" "functions_bucket" {
  name     = "${var.project_id}-functions"
  location = var.region

  uniform_bucket_level_access = true

  depends_on = [google_project_service.required_apis]
}

# ソースコードをZIPにしてアップロード
data "archive_file" "functions_source" {
  type        = "zip"
  source_dir  = "${path.module}/functions"
  output_path = "${path.module}/functions.zip"
}

resource "google_storage_bucket_object" "functions_zip" {
  name   = "functions-${data.archive_file.functions_source.output_md5}.zip"
  bucket = google_storage_bucket.functions_bucket.name
  source = data.archive_file.functions_source.output_path
}

# Cloud Functions用サービスアカウント
resource "google_service_account" "cloud_functions" {
  account_id   = "buzzbase-functions"
  display_name = "BuzzBase Cloud Functions Service Account"
}

# Cloud Functions Service Account - Firestore アクセス
# NOTE: Terraformサービスアカウントの権限制限により、手動で設定が必要
# gcloud projects add-iam-policy-binding sincere-kit \
#   --member="serviceAccount:buzzbase-functions@sincere-kit.iam.gserviceaccount.com" \
#   --role="roles/datastore.user"
# gcloud projects add-iam-policy-binding sincere-kit \
#   --member="serviceAccount:buzzbase-functions@sincere-kit.iam.gserviceaccount.com" \
#   --role="roles/secretmanager.secretAccessor"

# Cloud Function: Instagram OAuth Callback
resource "google_cloudfunctions_function" "instagram_callback" {
  name        = "instagramCallback"
  description = "Instagram OAuth コールバック処理"
  runtime     = "nodejs20"
  region      = var.region

  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.functions_bucket.name
  source_archive_object = google_storage_bucket_object.functions_zip.name
  trigger_http          = true
  entry_point           = "instagramCallback"

  service_account_email = google_service_account.cloud_functions.email

  environment_variables = {
    GCP_PROJECT  = var.project_id
    FRONTEND_URL = var.frontend_url
  }

  depends_on = [
    google_project_service.required_apis,
    google_service_account.cloud_functions,
  ]
}

# Cloud Functions - 未認証アクセスを許可（公開API）
resource "google_cloudfunctions_function_iam_member" "invoker" {
  project        = var.project_id
  region         = var.region
  cloud_function = google_cloudfunctions_function.instagram_callback.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
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
