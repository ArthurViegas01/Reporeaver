/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MCP_SERVER_URL?: string;
  readonly VITE_HEALTH_URL?: string;
  readonly VITE_ENVIRONMENT?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
