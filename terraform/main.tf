# =============================================================================
# main.tf - Devscope root composition
#
# Wires together the Railway (backend) and Netlify (frontend) modules.
# Redis lives outside Terraform on Upstash's free tier.
#
# Netlify site setup (one-time, manual):
#   1. Go to app.netlify.com -> Add new site -> Import from Git
#   2. Connect the repo; Netlify reads build config from netlify.toml
#   3. Copy the Site ID from Site configuration and set netlify_site_id via
#      TF_VAR_netlify_site_id or terraform.tfvars
#
# State backend: configure a remote backend (Terraform Cloud, S3, or GCS)
# before running apply in CI. Local state is discarded when the runner exits.
# See docs/DEPLOY.md for setup instructions.
# =============================================================================

locals {
  resource_prefix = "${var.project_name}-${var.environment}"
  # Railway subdomains are globally unique and claimed first-come-first-served.
  # "devscope-api-production" is already taken by an unrelated service, so we
  # use the "-mcp-" stem. If apply fails with a subdomain conflict, change this.
  backend_subdomain    = "${var.project_name}-mcp-${var.environment}"
  netlify_frontend_url = "https://${var.netlify_site_name}.netlify.app"
}

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
  cors_origins          = local.netlify_frontend_url
}

module "netlify" {
  source = "./modules/netlify"

  site_id       = var.netlify_site_id
  site_name     = var.netlify_site_name
  custom_domain = var.frontend_custom_domain

  backend_public_url = "${module.railway.backend_public_url}/mcp"

  environment = var.environment
}
