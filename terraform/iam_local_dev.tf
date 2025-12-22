# =============================================================================
# ローカル開発用サービスアカウント
# =============================================================================
#
# このファイルにはローカル開発・Terraform実行用の
# サービスアカウントとIAMバインディングが含まれます。
#
# 注意: このサービスアカウントは開発環境でのみ使用し、
#       本番環境では適切な権限のサービスアカウントを使用してください。
#
# =============================================================================

# -----------------------------------------------------------------------------
# Service Account
# -----------------------------------------------------------------------------

resource "google_service_account" "local_dev" {
  account_id   = "ken-kanayama"
  display_name = "ken.kanayama"
  description  = "ローカル開発用"
}

# -----------------------------------------------------------------------------
# IAM Bindings
# -----------------------------------------------------------------------------

# Editor権限（開発用に広範な権限を付与）
resource "google_project_iam_member" "local_dev_editor" {
  project = var.project_id
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.local_dev.email}"
}

# Cloud Functions管理権限
resource "google_project_iam_member" "local_dev_functions_admin" {
  project = var.project_id
  role    = "roles/cloudfunctions.admin"
  member  = "serviceAccount:${google_service_account.local_dev.email}"
}

# IAM管理権限（Terraform実行に必要）
resource "google_project_iam_member" "local_dev_iam_admin" {
  project = var.project_id
  role    = "roles/resourcemanager.projectIamAdmin"
  member  = "serviceAccount:${google_service_account.local_dev.email}"
}

