# =============================================================================
# Cloud Run - BuzzBase フロントエンド
# =============================================================================
#
# このファイルには Cloud Run に関連するすべてのリソースが含まれます:
#   - サービスアカウント
#   - IAMバインディング
#   - Cloud Runサービス
#   - 公開アクセス設定
#
# =============================================================================

# -----------------------------------------------------------------------------
# Service Account
# -----------------------------------------------------------------------------

resource "google_service_account" "cloud_run" {
  account_id   = "buzzbase-cloudrun"
  display_name = "BuzzBase Cloud Run Service Account"
}

# -----------------------------------------------------------------------------
# IAM Bindings
# -----------------------------------------------------------------------------

# Firestore アクセス権限
resource "google_project_iam_member" "cloudrun_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
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

# -----------------------------------------------------------------------------
# Public Access
# -----------------------------------------------------------------------------

# 未認証ユーザーからのアクセスを許可
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.buzzbase.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

