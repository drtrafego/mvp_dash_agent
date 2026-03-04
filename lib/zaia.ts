const ZAIA_BASE = "https://api.zaia.app";

export const zaiaFetch = async (
  endpoint: string,
  options: RequestInit = {},
  apiKey: string
) => {
  const res = await fetch(`${ZAIA_BASE}${endpoint}`, {
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
  getUsage: (apiKey: string) =>
    zaiaFetch("/v1.1/api/retrieve-usage", {}, apiKey),

  setMode: (agentId: string, mode: string, apiKey: string, sessionId?: string) =>
    zaiaFetch("/v1.1/api/agent/variables", {
      method: "PATCH",
      body: JSON.stringify({
        agentId,
        variables: { modo: mode, ...(sessionId ? { sessionId } : {}) },
      }),
    }, apiKey),

  sendMessage: (agentId: string, target: string, message: string, apiKey: string) =>
    zaiaFetch("/v1.1/api/agent/send-channel-message", {
      method: "POST",
      body: JSON.stringify({ agentId, channel: "whatsapp", target, message }),
    }, apiKey),

  cancelFollowUp: (agentId: string, sessionId: string, apiKey: string) =>
    zaiaFetch("/v1.1/api/agent/follow-up/cancel", {
      method: "POST",
      body: JSON.stringify({ agentId, sessionId }),
    }, apiKey),
};
