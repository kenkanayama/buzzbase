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

output "cloud_functions_service_account" {
  description = "Cloud Functions service account email"
  value       = google_service_account.cloud_functions.email
}

output "cloud_build_service_account" {
  description = "Cloud Build service account email"
  value       = google_service_account.cloud_build.email
}

output "firestore_database" {
  description = "Firestore database name"
  value       = google_firestore_database.buzzbase.name
}

