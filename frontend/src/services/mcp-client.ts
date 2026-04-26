/**
 * MCP client singleton wrapping @modelcontextprotocol/sdk.
 *
 * Connection lifecycle: lazy. The first call to `getMcpClient()` connects;
 * subsequent calls reuse the existing connection. Reconnect on transport error.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || "/mcp";

let _client: Client | null = null;
let _connecting: Promise<Client> | null = null;

/**
 * Custom fetch that intercepts GET requests to the MCP endpoint before a
 * session exists. The FastMCP server returns 400 (not 405) for these GETs,
 * but the SDK only handles 405 gracefully. Returning a synthetic 405 here
 * tells the transport to skip GET SSE and use POST-only mode.
 */
function makeMcpFetch(mcpUrl: URL): typeof fetch {
  return (input, init) => {
    const reqUrl = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
    const isGet = !init?.method || init.method.toUpperCase() === "GET";
    if (isGet && reqUrl === mcpUrl.href) {
      return Promise.resolve(new Response(null, { status: 405 }));
    }
    return fetch(input, init);
  };
}

async function _connect(): Promise<Client> {
  const url = new URL(SERVER_URL, window.location.origin);
  const transport = new StreamableHTTPClientTransport(url, {
    fetch: makeMcpFetch(url),
  });
  const client = new Client(
    { name: "reporeaver-frontend", version: "0.1.0" },
    { capabilities: {} },
  );
  await client.connect(transport);
  return client;
}

export async function getMcpClient(): Promise<Client> {
  if (_client) return _client;
  if (_connecting) return _connecting;
  _connecting = _connect()
    .then((c) => {
      _client = c;
      _connecting = null;
      return c;
    })
    .catch((err) => {
      _connecting = null;
      throw err;
    });
  return _connecting;
}

/** Force a reconnect on the next call (e.g. after a transport error). */
export function resetMcpClient(): void {
  if (_client) {
    _client.close().catch(() => undefined);
  }
  _client = null;
  _connecting = null;
}

/**
 * Generic typed helper around `client.callTool`.
 * The MCP server returns content blocks; for our tools we always return JSON
 * (Pydantic-serialised) inside the first text block.
 */
export async function callTool<T>(
  name: string,
  args: Record<string, unknown>,
  opts?: { onProgress?: (msg: string) => void },
): Promise<T> {
  const client = await getMcpClient();
  const result = await client.callTool(
    { name, arguments: args },
    undefined,
    {
      onprogress: (p: { progress?: number; total?: number; message?: string }) => {
        if (opts?.onProgress && typeof p.message === "string") {
          opts.onProgress(p.message);
        }
      },
    },
  );

  if (result.isError) {
    const text = extractText(result.content) || "Tool returned an error";
    throw new Error(text);
  }

  const text = extractText(result.content);
  if (!text) throw new Error("Empty response from tool");

  // FastMCP serialises Pydantic outputs as JSON in a TextContent block.
  try {
    return JSON.parse(text) as T;
  } catch {
    // Tool returned a plain string (e.g. recruiter summary markdown).
    return text as unknown as T;
  }
}

function extractText(content: unknown): string {
  if (!Array.isArray(content)) return "";
  for (const block of content) {
    if (block && typeof block === "object" && "type" in block && block.type === "text") {
      return String((block as { text: string }).text);
    }
  }
  return "";
}
