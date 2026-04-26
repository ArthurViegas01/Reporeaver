# =============================================================================
# main.tf - Reporeaver root composition
# -----------------------------------------------------------------------------
# Wires together the Railway (backend) and Netlify (frontend) modules.
# Cache (Redis) lives outside Terraform on Upstash's free tier.
#
# Netlify site setup (one-time, manual):
#   1. Go to app.netlify.com -> "Add new site" -> "Import from Git"
#   2. Connect the GitHub repo, set base = frontend/, publish = dist/
#   3. Copy the Site ID from Site configuration and set netlify_site_id in tfvars
# =============================================================================

locals {
  resource_prefix   = "${var.project_name}-${var.environment}"
  backend_subdomain = "${var.project_name}-api-${var.environment}"

  common_tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
    region      = var.railway_region
  }
}

# -----------------------------------------------------------------------------
# Railway: backend (FastMCP)
# -----------------------------------------------------------------------------

module "railway" {
  source = "./modules/railway"

  project_name      = local.resource_prefix
  region            = var.railway_region
  backend_subdomain = local.backend_subdomain

  backend_image     = var.backend_image
  backend_cpu       = var.backend_cpu
  backend_memory_mb = var.backend_memory_mb
  backend_replicas  = var.backend_replicas

  github_token          = var.github_token
  groq_api_key          = var.groq_api_key
  upstash_redis_url     = var.upstash_redis_url
  rate_limit_per_minute = var.rate_limit_per_minute
  log_level             = var.log_level
}

# -----------------------------------------------------------------------------
# Netlify: frontend (Vite/React)
# -----------------------------------------------------------------------------

module "netlify" {
  source = "./modules/netlify"

  site_id       = var.netlify_site_id
  site_name     = var.netlify_site_name
  custom_domain = var.frontend_custom_domain

  backend_public_url = module.railway.backend_public_url

  environment = var.environment
}
