/**
 * Frontend types mirroring the backend Pydantic models.
 *
 * Keep these in sync with backend/src/reporeaver/models/analysis.py.
 * In a larger project we'd auto-generate these from FastAPI's OpenAPI schema,
 * but for a demo a manually-maintained mirror is clearer.
 */

export interface LanguageStat {
  language: string;
  repo_count: number;
  percentage: number;
}

export interface RepoSummary {
  name: string;
  stars?: number;
  language?: string | null;
  description?: string | null;
  url?: string | null;
}

export interface RecentActivity {
  name: string;
  pushed_at: string | null;
  language?: string | null;
  url?: string | null;
}

export interface ProfileAnalysis {
  username: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  total_stars: number;
  top_languages: LanguageStat[];
  most_starred: RepoSummary[];
  recent_activity: RecentActivity[];
  profile_url: string | null;
  analyzed_at: string;
}

export interface RepositoryEvaluation {
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  primary_language: string | null;
  languages_breakdown: Record<string, number>;
  stars: number;
  forks: number;
  open_issues: number;
  topics: string[];
  has_readme: boolean;
  readme_excerpt: string | null;
  has_tests: boolean;
  has_ci: boolean;
  has_dockerfile: boolean;
  license: string | null;
  last_pushed: string | null;
  architecture_signals: string[];
  url: string | null;
}

export interface JobMatchResult {
  username: string;
  overall_match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  gaps: string[];
  summary: string;
}

/** Names of the tools registered on the MCP server. */
export type ToolName =
  | "analyze_profile"
  | "evaluate_repository"
  | "map_to_job"
  | "generate_recruiter_summary";

/** Health response shape. */
export interface HealthResponse {
  status: "ok" | "degraded";
  environment: string;
  region: string;
  model: string;
  redis: "ok" | "down";
  version: string;
}

/** Generic envelope returned by useToolCall. */
export interface ToolState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
