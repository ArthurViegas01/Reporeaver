# =============================================================================
# providers.tf — Central de Provedores e Autenticacao
# =============================================================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    railway = {
      source  = "terraform-community-providers/railway"
      version = "~> 0.6.2"
    }

    netlify = {
      source  = "netlify/netlify"
      version = "~> 0.4.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.6.0"
    }
  }
}

provider "railway" {
  token = var.railway_token
}

provider "netlify" {
  token = var.netlify_token
}
