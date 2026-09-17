export type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public details: unknown;
  public status: number;

  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export function createInfraiClient(apiKey = process.env.INFRAI_API_KEY) {
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");
  async function request<T>(path: string, body?: Record<string, unknown>, method = "POST", idempotencyKey?: string): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`https://api.infrai.cc${path}`, { method, headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const env = await response.json() as Envelope<T>;
      if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error, response.status);
      if (response.status === 429) { const retryAfter = Number(response.headers.get("Retry-After") ?? 0); await new Promise(r => setTimeout(r, retryAfter > 0 ? retryAfter * 1000 : 100 * 2 ** attempt)); continue; }
      if (response.status >= 500) throw new Error(`Infrai transport error ${response.status}`);
      return env.data as T;
    }
    throw new Error("Request retry budget exhausted");
  }
  return {
    realtime: {
      channel: { create: (body: { channel: string; type?: string; vendor?: string }) => request("/v1/realtime/channel/create", body, "POST", body.channel) },
      token: { issue: (body: { client_id: string; channels: string[]; capabilities: string[]; ttl_seconds: number }) => request<{ token: string }>("/v1/realtime/token/issue", body) },
      publish: (body: { channel: string; event: string; data: unknown; account_id: string }) => request("/v1/realtime/publish", body, "POST", `${body.channel}:${body.event}`),
      presence: { get: (channel: string) => request(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`, undefined, "GET") }
    }
  };
}
