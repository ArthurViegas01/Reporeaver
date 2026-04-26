# =============================================================================
# main.tf - Reporeaver root composition
# -----------------------------------------------------------------------------
# Wires together the Railway (backend) and Netlify (frontend) modules.
# Cache (Redis) lives outside Terraform on Upstash's free tier; its URL is
# passed in as a sensitive variable.
# Region policy (US-only, gru BANNED) is enforced inside variables.tf via
# `validation` blocks; this file simply consumes the validated inputs.
# =============================================================================

locals {
  resource_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
    region      = var.railway_region
  }
}

# A short random suffix ensures Netlify site names stay globally unique
# across re-creates without forcing manual renames.
resource "random_id" "site_suffix" {
  byte_length = 3
}

# -----------------------------------------------------------------------------
# Railway: backend (FastMCP)
# -----------------------------------------------------------------------------

module "railway" {
  source = "./modules/railway"

  project_name = local.resource_prefix
  region       = var.railway_region

  backend_image     = var.backend_image
  backend_cpu       = var.backend_cpu
  backend_memory_mb = var.backend_memory_mb
  backend_replicas  = var.backend_replicas

  # Secrets injected as Railway service variables (encrypted at rest).
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

  site_name     = "${local.resource_prefix}-${random_id.site_suffix.hex}"
  repo          = var.frontend_repo
  repo_branch   = var.frontend_repo_branch
  build_base    = var.frontend_build_base
  build_command = var.frontend_build_command
  publish_dir   = var.frontend_publish_dir
  custom_domain = var.frontend_custom_domain

  # The frontend talks to the backend via this URL - wired automatically.
  backend_public_url = module.railway.backend_public_url

  environment = var.environment
}
