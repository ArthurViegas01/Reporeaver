# =============================================================================
# modules/netlify/main.tf
# -----------------------------------------------------------------------------
# Manages environment variables and domain settings for a Netlify site.
#
# IMPORTANT: netlify/netlify v0.4+ does NOT support resource "netlify_site".
# The site must be connected to the GitHub repo via the Netlify UI (or CLI),
# which triggers automatic deploys on every push to the target branch.
# Build configuration is read from frontend/netlify.toml in the repository.
#
# To get the site_id: Netlify UI -> Site -> Site configuration -> Site ID.
# =============================================================================

terraform {
  required_providers {
    netlify = {
      source  = "netlify/netlify"
      version = "~> 0.4.0"
    }
  }
}

# --- Environment variables injected into the Netlify build ------------------

resource "netlify_environment_variable" "backend_url" {
  site_id = var.site_id
  key     = "VITE_MCP_SERVER_URL"
  values  = [{ value = var.backend_public_url, context = "all" }]
}

resource "netlify_environment_variable" "environment_name" {
  site_id = var.site_id
  key     = "VITE_ENVIRONMENT"
  values  = [{ value = var.environment, context = "all" }]
}

# --- Optional custom domain --------------------------------------------------

resource "netlify_site_domain_settings" "this" {
  count = var.custom_domain != "" ? 1 : 0

  site_id       = var.site_id
  custom_domain = var.custom_domain
}
