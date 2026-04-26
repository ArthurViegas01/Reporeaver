# =============================================================================
# outputs.tf - Public surface of the Reporeaver infrastructure
# =============================================================================

output "backend_public_url" {
  description = "Public HTTPS URL of the FastMCP backend on Railway."
  value       = module.railway.backend_public_url
}

output "backend_health_url" {
  description = "Health check endpoint for uptime monitors."
  value       = "${module.railway.backend_public_url}/health"
}

output "frontend_url" {
  description = "Public URL of the Netlify-hosted frontend."
  value       = module.netlify.site_url
}

output "frontend_admin_url" {
  description = "Netlify admin/dashboard URL for the site."
  value       = module.netlify.admin_url
}

output "deployed_region" {
  description = "Region where the backend is running. Should be a US region."
  value       = var.railway_region
}
