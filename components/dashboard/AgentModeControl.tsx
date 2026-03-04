"use client";

import { useState } from "react";

type Mode = "bot" | "humano" | "pausado";

const modes = [
  { key: "bot" as Mode, label: "🤖 BOT ATIVO", active: "border-green-500 bg-green-50 text-green-700 font-semibold", inactive: "border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-600" },
  { key: "humano" as Mode, label: "👤 MODO HUMANO", active: "border-blue-500 bg-blue-50 text-blue-700 font-semibold", inactive: "border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600" },
  { key: "pausado" as Mode, label: "⏸ PAUSADO", active: "border-gray-500 bg-gray-100 text-gray-700 font-semibold", inactive: "border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700" },
];

export default function AgentModeControl() {
  const [mode, setMode] = useState<Mode>("bot");
  const [loading, setLoading] = useState(false);

  const handleChange = async (newMode: Mode) => {
    if (loading || newMode === mode) return;
    setLoading(true);
    try {
      const res = await fetch("/api/agent/mode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      if (res.ok) setMode(newMode);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {modes.map(({ key, label, active, inactive }) => (
        <button
          key={key}
          onClick={() => handleChange(key)}
          disabled={loading}
          className={`px-5 py-2.5 rounded-xl border-2 text-sm transition-all disabled:opacity-50 ${mode === key ? active : inactive}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
