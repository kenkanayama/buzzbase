# =============================================================================
# Cloud Functions - Instagram OAuth Callback
# =============================================================================
#
# このファイルには Cloud Functions に関連するすべてのリソースが含まれます:
#   - サービスアカウント
#   - IAMバインディング
#   - ソースコード格納用ストレージバケット
#   - Cloud Function本体
#   - 公開アクセス設定
#
# =============================================================================

# -----------------------------------------------------------------------------
# Service Account
# -----------------------------------------------------------------------------

resource "google_service_account" "cloud_functions" {
  account_id   = "buzzbase-functions"
  display_name = "BuzzBase Cloud Functions Service Account"
}

# -----------------------------------------------------------------------------
# IAM Bindings
# -----------------------------------------------------------------------------

# Firestore アクセス権限
resource "google_project_iam_member" "functions_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
}

# Secret Manager アクセス権限
resource "google_project_iam_member" "functions_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
}

# -----------------------------------------------------------------------------
# Source Code Storage
# -----------------------------------------------------------------------------

# ソースコード格納用バケット
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

# -----------------------------------------------------------------------------
# Cloud Function: Instagram OAuth Callback
# -----------------------------------------------------------------------------

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

# -----------------------------------------------------------------------------
# Public Access
# -----------------------------------------------------------------------------

# 未認証アクセスを許可（公開API）
resource "google_cloudfunctions_function_iam_member" "invoker" {
  project        = var.project_id
  region         = var.region
  cloud_function = google_cloudfunctions_function.instagram_callback.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}

