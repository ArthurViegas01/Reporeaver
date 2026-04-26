# =============================================================================
# modules/netlify/variables.tf
# =============================================================================

variable "site_name" {
  description = "Globally unique Netlify site name (becomes <name>.netlify.app)."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]{3,63}$", var.site_name))
    error_message = "site_name must be lowercase, 3-63 chars, [a-z0-9-]."
  }
}

variable "repo" {
  description = "GitHub repository in `owner/name` format."
  type        = string
}

variable "repo_branch" {
  description = "Branch to auto-deploy from."
  type        = string
  default     = "main"
}

variable "build_base" {
  description = "Subdirectory in the monorepo where the frontend lives."
  type        = string
  default     = "frontend"
}

variable "build_command" {
  description = "Build command Netlify executes."
  type        = string
}

variable "publish_dir" {
  description = "Output directory (relative to build_base) Netlify publishes."
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
  description = "Logical environment name."
  type        = string
}
