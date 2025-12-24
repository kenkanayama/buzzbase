# =============================================================================
# BuzzBase - GCP Infrastructure with Terraform
# =============================================================================
#
# ファイル構成:
#   - main.tf           : Terraformブロック、プロバイダー設定、API有効化
#   - cloud_run.tf      : Cloud Run関連リソース
#   - cloud_functions.tf: Cloud Functions関連リソース
#   - cloud_build.tf    : Cloud Build・Artifact Registry関連リソース
#   - secrets.tf        : Secret Manager関連リソース
#   - iam_local_dev.tf  : ローカル開発用サービスアカウント
#   - variables.tf      : 変数定義
#   - outputs.tf        : 出力定義
#
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
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}
