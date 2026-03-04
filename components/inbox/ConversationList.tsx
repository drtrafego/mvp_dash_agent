"use client";

import { useState } from "react";

export interface Conversation {
  id: string;
  contactName?: string | null;
  contactPhone: string;
  lastMessage?: string | null;
  lastMessageAt?: string | Date | null;
  unreadCount: number;
  mode: string;
  status: string;
}

interface Props {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conv: Conversation) => void;
}

type Filter = "all" | "humano" | "open";

function timeAgo(date?: string | Date | null): string {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function ConversationList({ conversations, selectedId, onSelect }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = conversations.filter((c) => {
    if (filter === "humano") return c.mode === "humano";
    if (filter === "open") return c.status === "open";
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 px-3 pt-1">
        {(["all", "humano", "open"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              filter === f ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {{ all: "Todas", humano: "Humano", open: "Abertas" }[f]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Nenhuma conversa</div>
        ) : filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              selectedId === conv.id ? "bg-blue-50 border-l-4 border-l-blue-500 pl-3" : ""
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900 text-sm truncate">
                    {conv.contactName || conv.contactPhone}
                  </span>
                  {conv.mode === "humano" && (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full shrink-0">humano</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage || "Sem mensagens"}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-gray-400">{timeAgo(conv.lastMessageAt)}</span>
                {conv.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
