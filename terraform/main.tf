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
    "firestore.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudscheduler.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "firebase.googleapis.com",
    "identitytoolkit.googleapis.com",
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
  description   = "Docker repository for BuzzBase application"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Firestore Database
# -----------------------------------------------------------------------------

resource "google_firestore_database" "buzzbase" {
  provider    = google-beta
  name        = "(default)"
  location_id = var.firestore_location
  type        = "FIRESTORE_NATIVE"

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

# Cloud Functions 用 Service Account
resource "google_service_account" "cloud_functions" {
  account_id   = "buzzbase-functions"
  display_name = "BuzzBase Cloud Functions Service Account"
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

# Cloud Functions Service Account - Firestore アクセス
resource "google_project_iam_member" "functions_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
}

# Cloud Functions Service Account - Secret Manager アクセス
resource "google_project_iam_member" "functions_secretmanager" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
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
      }

      env {
        name  = "VITE_FIREBASE_PROJECT_ID"
        value = var.project_id
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
    ]
  }
}

# Cloud Run - 公開アクセス許可
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.buzzbase.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# -----------------------------------------------------------------------------
# Cloud Scheduler (再生数取得バッチ)
# -----------------------------------------------------------------------------

resource "google_cloud_scheduler_job" "view_count_batch" {
  name        = "buzzbase-viewcount-batch"
  description = "7日経過した投稿の再生数を取得するバッチジョブ"
  schedule    = "0 0 * * *" # 毎日0時に実行
  time_zone   = "Asia/Tokyo"

  http_target {
    http_method = "POST"
    uri         = "https://${var.region}-${var.project_id}.cloudfunctions.net/fetchViewCounts"

    oidc_token {
      service_account_email = google_service_account.cloud_functions.email
    }
  }

  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Secret Manager (APIキー等の管理)
# -----------------------------------------------------------------------------

resource "google_secret_manager_secret" "resend_api_key" {
  secret_id = "resend-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret" "instagram_api_key" {
  secret_id = "instagram-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret" "tiktok_api_key" {
  secret_id = "tiktok-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

