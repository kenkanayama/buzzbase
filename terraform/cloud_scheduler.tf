# =============================================================================
# Cloud Scheduler & Pub/Sub - PR投稿インサイトデータ取得バッチ
# =============================================================================
#
# このファイルには PR投稿の数値データ取得バッチに関連するリソースが含まれます:
#   - Pub/Subトピック・サブスクリプション
#   - Cloud Scheduler
#   - Cloud Functions（Pub/Subトリガー）
#   - 必要なIAMバインディング
#
# 処理フロー:
#   Cloud Scheduler (毎日23:00 JST)
#     ↓
#   Pub/Sub トピック
#     ↓
#   Cloud Functions (fetchPostInsights)
#     - 対象投稿を1件処理
#     - 残りがあれば同じPub/Subにパブリッシュ（再帰的に処理）
#
# =============================================================================

# -----------------------------------------------------------------------------
# Pub/Sub Topic
# -----------------------------------------------------------------------------

resource "google_pubsub_topic" "fetch_post_insights" {
  name = "fetch-post-insights"

  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Pub/Sub Subscription（Cloud Functionsがサブスクライブ）
# -----------------------------------------------------------------------------

resource "google_pubsub_subscription" "fetch_post_insights" {
  name  = "fetch-post-insights-sub"
  topic = google_pubsub_topic.fetch_post_insights.id

  # メッセージの確認応答期限（秒）
  ack_deadline_seconds = 60

  # メッセージ保持期間（7日）
  message_retention_duration = "604800s"

  # 期限切れサブスクリプションの自動削除を無効化
  expiration_policy {
    ttl = ""
  }

  depends_on = [google_pubsub_topic.fetch_post_insights]
}

# -----------------------------------------------------------------------------
# Cloud Scheduler
# -----------------------------------------------------------------------------

resource "google_cloud_scheduler_job" "fetch_post_insights" {
  name        = "fetch-post-insights-scheduler"
  description = "毎日23:00 JSTにPR投稿のインサイトデータ取得をトリガー"
  schedule    = "0 23 * * *"
  time_zone   = "Asia/Tokyo"
  region      = var.region

  pubsub_target {
    topic_name = google_pubsub_topic.fetch_post_insights.id
    data       = base64encode("{\"action\":\"start\"}")
  }

  retry_config {
    retry_count = 3
  }

  depends_on = [
    google_project_service.required_apis,
    google_pubsub_topic.fetch_post_insights,
  ]
}

# -----------------------------------------------------------------------------
# Cloud Functions: PR投稿インサイトデータ取得
# -----------------------------------------------------------------------------

resource "google_cloudfunctions_function" "fetch_post_insights" {
  name        = "fetchPostInsights"
  description = "PR投稿のインサイトデータをInstagram APIから取得してFirestoreに保存"
  runtime     = "nodejs20"
  region      = var.region

  available_memory_mb   = 512
  timeout               = 120
  source_archive_bucket = google_storage_bucket.functions_bucket.name
  source_archive_object = google_storage_bucket_object.functions_zip.name
  entry_point           = "fetchPostInsights"

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.fetch_post_insights.id
  }

  service_account_email = google_service_account.cloud_functions.email

  environment_variables = {
    GCP_PROJECT               = var.project_id
    PUBSUB_TOPIC              = google_pubsub_topic.fetch_post_insights.name
    FIRESTORE_DATABASE_ID     = "sincere-kit-buzzbase"
  }

  depends_on = [
    google_project_service.required_apis,
    google_service_account.cloud_functions,
    google_pubsub_topic.fetch_post_insights,
  ]
}

# -----------------------------------------------------------------------------
# IAM: Cloud Functions にPub/Sub パブリッシュ権限を付与
# -----------------------------------------------------------------------------

resource "google_project_iam_member" "functions_pubsub_publisher" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
}

# =============================================================================
# Cloud Scheduler & Pub/Sub - Instagramアクセストークン自動更新バッチ
# =============================================================================
#
# このファイルには Instagramアクセストークン自動更新バッチに関連するリソースが含まれます:
#   - Pub/Subトピック・サブスクリプション
#   - Cloud Scheduler
#   - Cloud Functions（Pub/Subトリガー）
#
# 処理フロー:
#   Cloud Scheduler (毎日2:00 JST)
#     ↓
#   Pub/Sub トピック
#     ↓
#   Cloud Functions (refreshInstagramTokens)
#     - instagramAccountsコレクションから全アカウントを取得
#     - 45日以内に期限切れになるトークンをリフレッシュ
#     - Firestoreに保存
#
# =============================================================================

# -----------------------------------------------------------------------------
# Pub/Sub Topic
# -----------------------------------------------------------------------------

resource "google_pubsub_topic" "refresh_instagram_tokens" {
  name = "refresh-instagram-tokens"

  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Pub/Sub Subscription（Cloud Functionsがサブスクライブ）
# -----------------------------------------------------------------------------

resource "google_pubsub_subscription" "refresh_instagram_tokens" {
  name  = "refresh-instagram-tokens-sub"
  topic = google_pubsub_topic.refresh_instagram_tokens.id

  # メッセージの確認応答期限（秒）
  ack_deadline_seconds = 60

  # メッセージ保持期間（7日）
  message_retention_duration = "604800s"

  # 期限切れサブスクリプションの自動削除を無効化
  expiration_policy {
    ttl = ""
  }

  depends_on = [google_pubsub_topic.refresh_instagram_tokens]
}

# -----------------------------------------------------------------------------
# Cloud Scheduler
# -----------------------------------------------------------------------------

resource "google_cloud_scheduler_job" "refresh_instagram_tokens" {
  name        = "refresh-instagram-tokens-scheduler"
  description = "毎日2:00 JSTにInstagramアクセストークンの自動更新をトリガー"
  schedule    = "0 2 * * *"
  time_zone   = "Asia/Tokyo"
  region      = var.region

  pubsub_target {
    topic_name = google_pubsub_topic.refresh_instagram_tokens.id
    data       = base64encode("{\"action\":\"refresh\"}")
  }

  retry_config {
    retry_count = 3
  }

  depends_on = [
    google_project_service.required_apis,
    google_pubsub_topic.refresh_instagram_tokens,
  ]
}

# -----------------------------------------------------------------------------
# Cloud Functions: Instagramアクセストークン自動更新
# -----------------------------------------------------------------------------

resource "google_cloudfunctions_function" "refresh_instagram_tokens" {
  name        = "refreshInstagramTokens"
  description = "Instagramアクセストークンを自動更新してFirestoreに保存"
  runtime     = "nodejs20"
  region      = var.region

  available_memory_mb   = 256
  timeout               = 120
  source_archive_bucket = google_storage_bucket.functions_bucket.name
  source_archive_object = google_storage_bucket_object.functions_zip.name
  entry_point           = "refreshInstagramTokens"

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.refresh_instagram_tokens.id
  }

  service_account_email = google_service_account.cloud_functions.email

  environment_variables = {
    GCP_PROJECT           = var.project_id
    FIRESTORE_DATABASE_ID = "sincere-kit-buzzbase"
  }

  depends_on = [
    google_project_service.required_apis,
    google_service_account.cloud_functions,
    google_pubsub_topic.refresh_instagram_tokens,
  ]
}

