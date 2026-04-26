# =============================================================================
# variables.tf - Inputs for the Reporeaver infrastructure
# -----------------------------------------------------------------------------
# REGION POLICY (NON-NEGOTIABLE)
#   The Sao Paulo (gru / sa-* / southamerica-*) datacenters frequently run
#   out of capacity and degrade availability. The validation blocks below
#   REJECT any region in those zones at `terraform plan` time, so the policy
#   is enforced even if someone edits a tfvars file.
#
#   Allowed Railway regions (US only):
#     - us-west1   (Pacific Northwest)
#     - us-west2   (California)
#     - us-east4   (Virginia)         <-- DEFAULT
# =============================================================================

# -----------------------------------------------------------------------------
# Project identity
# -----------------------------------------------------------------------------

variable "project_name" {
  description = "Logical project name. Used as a prefix for resources."
  type        = string
  default     = "reporeaver"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,30}$", var.project_name))
    error_message = "project_name must be lowercase, start with a letter, contain only [a-z0-9-]."
  }
}

variable "environment" {
  description = "Deployment environment (production, staging)."
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging"], var.environment)
    error_message = "environment must be one of: production, staging."
  }
}

# -----------------------------------------------------------------------------
# Region policy - US ONLY
# -----------------------------------------------------------------------------

variable "railway_region" {
  description = "Railway region. Must be a US region. Sao Paulo (gru) is BANNED. Allowed: us-west1, us-west2, us-east4."
  type        = string
  default     = "us-east4"

  validation {
    condition     = contains(["us-west1", "us-west2", "us-east4"], var.railway_region)
    error_message = "railway_region must be one of: us-west1, us-west2, us-east4. Sao Paulo (gru), sa-*, southamerica-* are explicitly forbidden."
  }

  validation {
    condition     = !can(regex("(?i)(gru|sa-|sao|southamerica|brazil|br-)", var.railway_region))
    error_message = "Detected a South American / Sao Paulo region pattern. Forbidden by project policy."
  }
}

# -----------------------------------------------------------------------------
# Secrets (TF_VAR_* env vars - never commit)
# -----------------------------------------------------------------------------

variable "railway_token" {
  description = "Railway API token. Set via env var TF_VAR_railway_token."
  type        = string
  sensitive   = true
}

variable "netlify_token" {
  description = "Netlify Personal Access Token. Set via env var TF_VAR_netlify_token."
  type        = string
  sensitive   = true
}

variable "github_token" {
  description = "GitHub Personal Access Token consumed by the MCP backend."
  type        = string
  sensitive   = true

  validation {
    condition     = var.github_token == "" || length(var.github_token) >= 20
    error_message = "github_token looks too short to be a valid PAT."
  }
}

variable "groq_api_key" {
  description = "Groq API key used by the LLM service (Llama 3 streaming)."
  type        = string
  sensitive   = true

  validation {
    condition     = var.groq_api_key == "" || length(var.groq_api_key) >= 20
    error_message = "groq_api_key looks too short."
  }
}

variable "upstash_redis_url" {
  description = "Upstash Redis connection URL (rediss://default:<token>@<host>:<port>). Free-tier-friendly cache + rate-limiter store."
  type        = string
  sensitive   = true

  validation {
    condition     = var.upstash_redis_url == "" || can(regex("^rediss?://", var.upstash_redis_url))
    error_message = "upstash_redis_url must start with redis:// or rediss://"
  }
}

# -----------------------------------------------------------------------------
# Backend (Railway)
# -----------------------------------------------------------------------------

variable "backend_image" {
  description = "Container image for the FastMCP backend (e.g. ghcr.io/<owner>/reporeaver-backend:latest)."
  type        = string
  default     = "ghcr.io/arthurpviegas/reporeaver-backend:latest"
}

variable "backend_cpu" {
  description = "vCPU allocation for the backend service."
  type        = number
  default     = 1
}

variable "backend_memory_mb" {
  description = "Memory allocation for the backend service, in MB. 512 keeps Railway credit usage low."
  type        = number
  default     = 512

  validation {
    condition     = var.backend_memory_mb >= 256 && var.backend_memory_mb <= 8192
    error_message = "backend_memory_mb must be between 256 and 8192."
  }
}

variable "backend_replicas" {
  description = "Number of backend replicas."
  type        = number
  default     = 1
}

variable "rate_limit_per_minute" {
  description = "Per-IP rate limit applied by fastapi-limiter."
  type        = number
  default     = 30
}

# -----------------------------------------------------------------------------
# Frontend (Netlify)
# -----------------------------------------------------------------------------

variable "netlify_site_id" {
  description = "Netlify site ID. Found at: Netlify UI → Site → Site configuration → Site ID. Set via TF_VAR_netlify_site_id."
  type        = string
  sensitive   = true
  default     = "00000000-0000-0000-0000-000000000000" # placeholder; override in tfvars
}

variable "netlify_site_name" {
  description = "Netlify site subdomain name (e.g. 'reporeaver' → reporeaver.netlify.app). Used for output URLs."
  type        = string
  default     = "reporeaver"
}

variable "frontend_custom_domain" {
  description = "Optional custom domain for the frontend. Empty string = use Netlify default."
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Observability
# -----------------------------------------------------------------------------

variable "log_level" {
  description = "Log level for the backend (DEBUG, INFO, WARNING, ERROR)."
  type        = string
  default     = "INFO"

  validation {
    condition     = contains(["DEBUG", "INFO", "WARNING", "ERROR"], var.log_level)
    error_message = "log_level must be one of: DEBUG, INFO, WARNING, ERROR."
  }
}
