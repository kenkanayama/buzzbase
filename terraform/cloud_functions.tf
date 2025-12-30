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

# Cloud Storage アクセス権限（プロフィール画像保存用）
resource "google_project_iam_member" "functions_storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
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

# -----------------------------------------------------------------------------
# Profile Images Storage
# -----------------------------------------------------------------------------

# プロフィール画像保存用バケット
resource "google_storage_bucket" "profile_images" {
  name     = "${var.project_id}-profile-images"
  location = var.region

  uniform_bucket_level_access = true

  # 画像は永続的に保持（ライフサイクルルールなし）

  depends_on = [google_project_service.required_apis]
}

# プロフィール画像バケットを公開読み取り可能に設定
resource "google_storage_bucket_iam_member" "profile_images_public" {
  bucket = google_storage_bucket.profile_images.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# -----------------------------------------------------------------------------
# Post Thumbnails Storage
# -----------------------------------------------------------------------------

# 投稿サムネイル保存用バケット
resource "google_storage_bucket" "post_thumbnails" {
  name     = "sincere-kit-post-thumbnails"
  location = var.region

  uniform_bucket_level_access = true

  # 画像は永続的に保持（ライフサイクルルールなし）

  depends_on = [google_project_service.required_apis]
}

# 投稿サムネイルバケットを公開読み取り可能に設定
resource "google_storage_bucket_iam_member" "post_thumbnails_public" {
  bucket = google_storage_bucket.post_thumbnails.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
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
    GCP_PROJECT           = var.project_id
    FRONTEND_URL          = var.frontend_url
    PROFILE_IMAGES_BUCKET = google_storage_bucket.profile_images.name
  }

  depends_on = [
    google_project_service.required_apis,
    google_service_account.cloud_functions,
  ]
}

# -----------------------------------------------------------------------------
# Cloud Function: Instagram投稿取得
# -----------------------------------------------------------------------------

resource "google_cloudfunctions_function" "get_instagram_media" {
  name        = "getInstagramMedia"
  description = "Instagram投稿一覧を取得（認証必須）"
  runtime     = "nodejs20"
  region      = var.region

  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.functions_bucket.name
  source_archive_object = google_storage_bucket_object.functions_zip.name
  trigger_http          = true
  entry_point           = "getInstagramMedia"

  service_account_email = google_service_account.cloud_functions.email

  environment_variables = {
    GCP_PROJECT           = var.project_id
    FRONTEND_URL          = var.frontend_url
    PROFILE_IMAGES_BUCKET = google_storage_bucket.profile_images.name
  }

  depends_on = [
    google_project_service.required_apis,
    google_service_account.cloud_functions,
  ]
}

# -----------------------------------------------------------------------------
# Public Access
# -----------------------------------------------------------------------------

# Instagram OAuth Callback: 未認証アクセスを許可（公開API）
resource "google_cloudfunctions_function_iam_member" "invoker" {
  project        = var.project_id
  region         = var.region
  cloud_function = google_cloudfunctions_function.instagram_callback.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}

# Instagram投稿取得: 認証済みユーザーのみアクセス可能
# 注意: エンドポイント内でFirebase IDトークンを検証するため、allUsersに設定
# 実際の認証はエンドポイント内で行う
resource "google_cloudfunctions_function_iam_member" "get_instagram_media_invoker" {
  project        = var.project_id
  region         = var.region
  cloud_function = google_cloudfunctions_function.get_instagram_media.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}

# -----------------------------------------------------------------------------
# Cloud Function: PR投稿インサイトデータ即時取得（Meta審査用）
# -----------------------------------------------------------------------------

resource "google_cloudfunctions_function" "fetch_post_insights_immediate" {
  name        = "fetchPostInsightsImmediate"
  description = "Fetch Instagram insights data immediately after PR post registration (for Meta review)"
  runtime     = "nodejs20"
  region      = var.region

  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.functions_bucket.name
  source_archive_object = google_storage_bucket_object.functions_zip.name
  trigger_http          = true
  entry_point           = "fetchPostInsightsImmediate"

  service_account_email = google_service_account.cloud_functions.email

  environment_variables = {
    GCP_PROJECT           = var.project_id
    FRONTEND_URL          = var.frontend_url
    PROFILE_IMAGES_BUCKET = google_storage_bucket.profile_images.name
  }

  depends_on = [
    google_project_service.required_apis,
    google_service_account.cloud_functions,
  ]
}

# PR投稿インサイトデータ即時取得: 認証済みユーザーのみアクセス可能
resource "google_cloudfunctions_function_iam_member" "fetch_post_insights_immediate_invoker" {
  project        = var.project_id
  region         = var.region
  cloud_function = google_cloudfunctions_function.fetch_post_insights_immediate.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}

# -----------------------------------------------------------------------------
# Cloud Function: サムネイル画像保存
# -----------------------------------------------------------------------------

resource "google_cloudfunctions_function" "save_thumbnail_to_storage" {
  name        = "saveThumbnailToStorage"
  description = "投稿サムネイル画像をCloud Storageに保存"
  runtime     = "nodejs20"
  region      = var.region

  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.functions_bucket.name
  source_archive_object = google_storage_bucket_object.functions_zip.name
  trigger_http          = true
  entry_point           = "saveThumbnailToStorage"

  service_account_email = google_service_account.cloud_functions.email

  environment_variables = {
    GCP_PROJECT            = var.project_id
    FRONTEND_URL           = var.frontend_url
    POST_THUMBNAILS_BUCKET = google_storage_bucket.post_thumbnails.name
  }

  depends_on = [
    google_project_service.required_apis,
    google_service_account.cloud_functions,
  ]
}

# サムネイル保存: 認証済みユーザーのみアクセス可能
# 注意: エンドポイント内でFirebase IDトークンを検証するため、allUsersに設定
# 実際の認証はエンドポイント内で行う
resource "google_cloudfunctions_function_iam_member" "save_thumbnail_invoker" {
  project        = var.project_id
  region         = var.region
  cloud_function = google_cloudfunctions_function.save_thumbnail_to_storage.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}

