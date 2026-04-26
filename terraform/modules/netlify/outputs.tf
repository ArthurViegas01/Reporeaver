# =============================================================================
# modules/netlify/outputs.tf
# =============================================================================

output "site_id" {
  description = "Netlify site ID."
  value       = netlify_site.this.id
}

output "site_url" {
  description = "Public URL of the site."
  value       = var.custom_domain != "" ? "https://${var.custom_domain}" : "https://${netlify_site.this.name}.netlify.app"
}

output "admin_url" {
  description = "Netlify admin/dashboard URL."
  value       = "https://app.netlify.com/sites/${netlify_site.this.name}"
}
