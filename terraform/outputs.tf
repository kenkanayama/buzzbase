# =============================================================================
# BuzzBase - Terraform Outputs
# =============================================================================

output "cloud_run_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.buzzbase.uri
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository path"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.buzzbase.repository_id}"
}

output "cloud_run_service_account" {
  description = "Cloud Run service account email"
  value       = google_service_account.cloud_run.email
}

output "cloud_build_service_account" {
  description = "Cloud Build service account email"
  value       = google_service_account.cloud_build.email
}

output "instagram_callback_url" {
  description = "Instagram OAuth callback URL (register this in Meta App Dashboard)"
  value       = google_cloudfunctions_function.instagram_callback.https_trigger_url
}

output "cloud_functions_service_account" {
  description = "Cloud Functions service account email"
  value       = google_service_account.cloud_functions.email
}
