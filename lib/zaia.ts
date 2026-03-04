const ZAIA_BASE = "https://api.zaia.app";
const ZAIA_CORE = "https://core-service.zaia.app";

export const zaiaFetch = async (
  endpoint: string,
  options: RequestInit = {},
  apiKey: string,
  baseUrl = ZAIA_BASE
) => {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zaia API ${res.status}: ${err}`);
  }
  return res.json();
};

export const zaiaAPI = {
  // ─── Consumo ─────────────────────────────────────────────────────────────
  getUsage: (apiKey: string) =>
    zaiaFetch("/v1.1/api/retrieve-usage", {}, apiKey),

  // ─── Agente ──────────────────────────────────────────────────────────────
  getAgent: (agentId: string, apiKey: string) =>
    zaiaFetch(`/v1.1/api/agent/retrieve?agentId=${agentId}`, {}, apiKey),

  updateAgent: (agentId: string, data: Record<string, unknown>, apiKey: string) =>
    zaiaFetch("/v1.1/api/agent/update", {
      method: "PATCH",
      body: JSON.stringify({ agentId, ...data }),
    }, apiKey),

  // ─── Modo / Variáveis ─────────────────────────────────────────────────────
  setMode: (agentId: string, mode: string, apiKey: string, sessionId?: string) =>
    zaiaFetch("/v1.1/api/agent/variables", {
      method: "PATCH",
      body: JSON.stringify({
        agentId,
        variables: { modo: mode, ...(sessionId ? { sessionId } : {}) },
      }),
    }, apiKey),

  // ─── Chat / Transbordo ───────────────────────────────────────────────────
  resolveTakeover: (chatId: string, apiKey: string) =>
    zaiaFetch("/v1.1/api/external-generative-chat/resolve-takeover", {
      method: "PATCH",
      body: JSON.stringify({ externalGenerativeChatId: chatId }),
    }, apiKey),

  // ─── Mensagens ───────────────────────────────────────────────────────────
  sendMessage: (agentId: string, target: string, message: string, apiKey: string) =>
    zaiaFetch("/message-cross-channel/create", {
      method: "POST",
      body: JSON.stringify({ agentId, whatsAppPhoneNumber: target, message }),
    }, apiKey, ZAIA_CORE),

  sendMedia: (agentId: string, target: string, payload: { message?: string; imageUrl?: string; audioUrl?: string }, apiKey: string) =>
    zaiaFetch("/message-cross-channel/create", {
      method: "POST",
      body: JSON.stringify({ agentId, whatsAppPhoneNumber: target, ...payload }),
    }, apiKey, ZAIA_CORE),

  // ─── Follow Up ────────────────────────────────────────────────────────────
  listFollowUps: (agentId: string, apiKey: string) =>
    zaiaFetch(`/v1.1/api/agent-follow-up/retrieve-multiple?agentId=${agentId}`, {}, apiKey),

  createFollowUp: (agentId: string, data: { sessionId: string; message: string; delayMinutes: number }, apiKey: string) =>
    zaiaFetch("/v1.1/api/agent-follow-up/create", {
      method: "POST",
      body: JSON.stringify({ agentId, ...data }),
    }, apiKey),

  updateFollowUp: (followUpId: string, data: Record<string, unknown>, apiKey: string) =>
    zaiaFetch("/v1.1/api/agent-follow-up/update", {
      method: "PATCH",
      body: JSON.stringify({ id: followUpId, ...data }),
    }, apiKey),

  deleteFollowUp: (followUpId: string, apiKey: string) =>
    zaiaFetch(`/v1.1/api/agent-follow-up/remove?id=${followUpId}`, { method: "DELETE" }, apiKey),

  cancelFollowUps: (agentId: string, sessionId: string, apiKey: string) =>
    zaiaFetch("/v1.1/api/agent-follow-up/cancel", {
      method: "POST",
      body: JSON.stringify({ agentId, sessionId }),
    }, apiKey),

  // ─── Chats externos (via Zaia) ────────────────────────────────────────────
  listZaiaChats: (agentId: string, apiKey: string, limit = 50, offset = 0) =>
    zaiaFetch(`/v1.1/api/external-generative-chat/retrieve-multiple?agentIds=${agentId}&limit=${limit}&offset=${offset}`, {}, apiKey),

  listZaiaMessages: (chatIds: string, apiKey: string) =>
    zaiaFetch(`/v1.1/api/external-generative-message/retrieve-multiple?externalGenerativeChatIds=${chatIds}`, {}, apiKey),
};
