# =============================================================================
# modules/railway/outputs.tf
# =============================================================================

output "backend_public_url" {
  description = "HTTPS URL Railway assigned to the backend service."
  value       = "https://${railway_service_domain.backend.subdomain}.up.railway.app"
}

output "project_id" {
  description = "Railway project ID."
  value       = railway_project.this.id
}

output "service_id" {
  description = "Railway backend service ID (RAILWAY_SERVICE_ID secret for the redeploy trigger)."
  value       = railway_service.backend.id
}

output "environment_id" {
  description = "Railway production environment ID."
  value       = railway_environment.production.id
}
