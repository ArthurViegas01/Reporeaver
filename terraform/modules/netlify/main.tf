# =============================================================================
# modules/netlify/main.tf
# -----------------------------------------------------------------------------
# Provisions a Netlify site connected to the GitHub monorepo, scoped to the
# /frontend subdirectory. Netlify is a global CDN, so no region knob applies
# — the SP region restriction is only relevant for Railway.
#
# Provider: netlify/netlify (~> 0.2)
# =============================================================================

terraform {
  required_providers {
    netlify = {
      source  = "netlify/netlify"
      version = "~> 0.2"
    }
  }
}

resource "netlify_site" "this" {
  name = var.site_name

  repo {
    provider    = "github"
    repo_path   = var.repo
    repo_branch = var.repo_branch
    command     = var.build_command
    dir         = "${var.build_base}/${var.publish_dir}"
    base        = var.build_base
  }
}

# --- Environment variables for the build ---------------------------------------
# These are injected at build-time by Vite (everything starting with VITE_).

resource "netlify_environment_variable" "backend_url" {
  site_id = netlify_site.this.id
  key     = "VITE_MCP_SERVER_URL"
  values = [
    {
      value   = var.backend_public_url
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "environment" {
  site_id = netlify_site.this.id
  key     = "VITE_ENVIRONMENT"
  values = [
    {
      value   = var.environment
      context = "all"
    }
  ]
}

# --- Optional custom domain ----------------------------------------------------

resource "netlify_site_domain_settings" "this" {
  count = var.custom_domain != "" ? 1 : 0

  site_id       = netlify_site.this.id
  custom_domain = var.custom_domain
}
