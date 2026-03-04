"use client";

import { useState, useRef, useEffect } from "react";
import { Conversation } from "./ConversationList";

export interface Message {
  id: string;
  direction: string;
  content: string;
  sentBy: string;
  timestamp: string | Date;
}

interface Props {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (msg: string) => Promise<void>;
  onModeChange: (mode: "bot" | "humano") => Promise<void>;
}

function fmtTime(d: string | Date) {
  return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function bubbleClass(msg: Message) {
  if (msg.direction === "in") return "bg-gray-100 text-gray-900 self-start rounded-br-2xl rounded-bl-sm";
  if (msg.sentBy === "human") return "bg-blue-600 text-white self-end rounded-bl-2xl rounded-br-sm";
  return "bg-green-500 text-white self-end rounded-bl-2xl rounded-br-sm";
}

function senderLabel(msg: Message) {
  if (msg.direction === "in") return "CLIENTE";
  if (msg.sentBy === "human") return "HUMANO";
  return "BOT";
}

export default function ChatWindow({ conversation, messages, onSendMessage, onModeChange }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try { await onSendMessage(text.trim()); setText(""); } finally { setSending(false); }
  };

  const handleToggle = async () => {
    setToggling(true);
    try { await onModeChange(conversation.mode === "bot" ? "humano" : "bot"); } finally { setToggling(false); }
  };

  const isHuman = conversation.mode === "humano";

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{conversation.contactName || conversation.contactPhone}</h3>
          <p className="text-xs text-gray-500">{conversation.contactPhone}</p>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
            isHuman ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isHuman ? "Devolver ao Bot" : "Assumir e Responder"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Nenhuma mensagem ainda</p>
        ) : messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col max-w-[70%] ${msg.direction === "out" ? "ml-auto items-end" : "items-start"}`}>
            <span className="text-[10px] text-gray-400 mb-1 px-1">{senderLabel(msg)} · {fmtTime(msg.timestamp)}</span>
            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${bubbleClass(msg)}`}>{msg.content}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        {!isHuman && (
          <p className="text-xs text-gray-400 mb-2 text-center">
            Clique em &quot;Assumir e Responder&quot; para enviar mensagens
          </p>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={!isHuman || sending}
            placeholder={isHuman ? "Digite sua mensagem... (Enter para enviar)" : "Bot está respondendo..."}
            rows={2}
            className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending || !isHuman}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed h-[52px]"
          >
            {sending ? "..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
