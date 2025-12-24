# =============================================================================
# Secret Manager - 機密情報の管理
# =============================================================================
#
# このファイルには Secret Manager に関連するすべてのリソースが含まれます:
#   - Firebase設定のシークレット
#   - Meta App (Instagram) シークレット
#
# 注意: シークレットの値は Terraform で管理せず、
#       GCP Console または gcloud CLI で設定してください。
#
# =============================================================================

# -----------------------------------------------------------------------------
# Firebase Configuration Secrets
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
# Meta App (Instagram) Secrets
# -----------------------------------------------------------------------------

resource "google_secret_manager_secret" "meta_instagram_app_secret" {
  secret_id = "meta-instagram-app-secret"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

