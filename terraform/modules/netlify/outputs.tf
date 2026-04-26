# =============================================================================
# modules/netlify/outputs.tf
# =============================================================================

output "site_id" {
  description = "Netlify site ID (pass-through of input variable)."
  value       = var.site_id
}

output "site_url" {
  description = "Public URL of the Netlify site."
  value       = var.custom_domain != "" ? "https://${var.custom_domain}" : "https://${var.site_name}.netlify.app"
}

output "admin_url" {
  description = "Netlify admin/dashboard URL for the site."
  value       = "https://app.netlify.com/sites/${var.site_name}"
}
