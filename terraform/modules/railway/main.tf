# =============================================================================
# modules/railway/main.tf
# -----------------------------------------------------------------------------
# Provisions on Railway:
#   1. A project + a "production" environment
#   2. FastMCP backend service from a Docker image, with a public domain
#
# Cache (Redis) is intentionally NOT hosted on Railway — Upstash's free tier
# is permanent (10k commands/day, 256 MB) and avoids burning Railway credit.
#
# Provider: terraform-community-providers/railway (~> 0.5)
# =============================================================================

terraform {
  required_providers {
    railway = {
      source = "terraform-community-providers/railway"
    }
  }
}

# -----------------------------------------------------------------------------
# Project + environment
# -----------------------------------------------------------------------------

resource "railway_project" "this" {
  name        = var.project_name
  description = "GitHub Portfolio Intel — MCP server (region: ${var.region})"
  private     = false
}

resource "railway_environment" "production" {
  name       = "production"
  project_id = railway_project.this.id
}

# -----------------------------------------------------------------------------
# Backend (FastMCP) service
# -----------------------------------------------------------------------------

resource "railway_service" "backend" {
  name         = "backend"
  project_id   = railway_project.this.id
  source_image = var.backend_image
}

# Public HTTPS domain (*.up.railway.app). Free, auto-issued cert.
resource "railway_service_domain" "backend" {
  environment_id = railway_environment.production.id
  service_id     = railway_service.backend.id
  subdomain      = var.backend_subdomain
}

# --- Service variables (secrets + config) -------------------------------------

locals {
  backend_env = {
    # --- Server config ---
    MCP_HOST      = "0.0.0.0"
    MCP_PORT      = "8000"
    MCP_TRANSPORT = "streamable-http"
    ENVIRONMENT   = "production"
    LOG_LEVEL     = var.log_level

    # --- Integrations ---
    GITHUB_TOKEN = var.github_token
    GROQ_API_KEY = var.groq_api_key

    # --- Cache & rate limiting (Upstash) ---
    REDIS_URL             = var.upstash_redis_url
    RATE_LIMIT_PER_MINUTE = tostring(var.rate_limit_per_minute)

    # --- Region pin: surfaced via /health ---
    DEPLOY_REGION = var.region
  }
}

resource "railway_variable" "backend" {
  for_each = local.backend_env

  name           = each.key
  value          = each.value
  service_id     = railway_service.backend.id
  environment_id = railway_environment.produ