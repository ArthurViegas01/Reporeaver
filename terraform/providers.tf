# =============================================================================
# providers.tf — Provider declarations and authentication
# -----------------------------------------------------------------------------
# - Railway: deploys the FastMCP backend (Docker) + managed Redis instance.
# - Netlify: deploys the Vite/React frontend (static + edge functions).
#
# Authentication is read exclusively from environment variables. Never commit
# tokens to the repo. See terraform.tfvars.example and the README for the
# required env vars (RAILWAY_TOKEN, NETLIFY_TOKEN).
# =============================================================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    railway = {
      source  = "terraform-community-providers/railway"
      version = "~> 0.5"
    }

    netlify = {
      source  = "netlify/netlify"
      version = "~> 0.2"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Remote state recommended for team / CI usage. Uncomment and configure
  # before running `terraform init` in production.
  #
  # backend "s3" {
  #   bucket         = "reporeaver-tfstate"
  #   key            = "production/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "reporeaver-tfstate-lock"
  # }
}

provider "railway" {
  # token is read from env var RAILWAY_TOKEN (provider default).
  # Override only if you have a per-environment token strategy.
  token = var.railway_token
}

provider "netlify" {
  # token is read from env var NETLIFY_TOKEN (provider default).
  token = var.netlify_token
}
