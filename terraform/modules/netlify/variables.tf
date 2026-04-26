# =============================================================================
# modules/netlify/variables.tf
# =============================================================================

variable "site_id" {
  description = "Netlify site ID. Found at: Netlify UI -> Site -> Site configuration -> Site ID."
  type        = string
}

variable "site_name" {
  description = "Netlify site subdomain (e.g. 'reporeaver' -> reporeaver.netlify.app). Used for output URLs only."
  type        = string
}

variable "custom_domain" {
  description = "Optional custom domain. Empty string = use Netlify default."
  type        = string
  default     = ""
}

variable "backend_public_url" {
  description = "Public URL of the backend, injected as VITE_MCP_SERVER_URL."
  type        = string
}

variable "environment" {
  description = "Logical environment name (production, staging)."
  type        = string
}
