"use client";

import { useState, useEffect, useCallback } from "react";
import ConversationList, { Conversation } from "@/components/inbox/ConversationList";
import ChatWindow, { Message } from "@/components/inbox/ChatWindow";

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConvs = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
        setSelected((prev) => prev ? (data.conversations.find((c: Conversation) => c.id === prev.id) ?? prev) : null);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const fetchMsgs = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) { const d = await res.json(); setMessages(d.messages); }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchConvs(); }, [fetchConvs]);
  useEffect(() => { const t = setInterval(fetchConvs, 3000); return () => clearInterval(t); }, [fetchConvs]);

  useEffect(() => {
    if (!selected) { setMessages([]); return; }
    fetchMsgs(selected.id);
    const t = setInterval(() => fetchMsgs(selected.id), 3000);
    return () => clearInterval(t);
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (message: string) => {
    if (!selected) return;
    await fetch("/api/agent/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selected.id, message }),
    });
    await fetchMsgs(selected.id);
  };

  const handleMode = async (mode: "bot" | "humano") => {
    if (!selected) return;
    await fetch("/api/agent/mode", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, sessionId: selected.contactPhone }),
    });
    const updated = { ...selected, mode };
    setSelected(updated);
    setConversations((prev) => prev.map((c) => (c.id === selected.id ? { ...c, mode } : c)));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400 text-sm">Carregando conversas...</p>
    </div>
  );

  return (
    <div className="flex h-full">
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-sm">Inbox</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {conversations.filter((c) => c.unreadCount > 0).length} não lidas
          </p>
        </div>
        <ConversationList conversations={conversations} selectedId={selected?.id} onSelect={setSelected} />
      </div>

      <div className="flex-1 min-w-0">
        {selected ? (
          <ChatWindow conversation={selected} messages={messages} onSendMessage={handleSend} onModeChange={handleMode} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-5xl mb-3">💬</p>
              <p className="text-sm font-medium">Selecione uma conversa</p>
              <p className="text-xs mt-1">Mensagens em tempo real a cada 3s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
