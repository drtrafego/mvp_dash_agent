"use client";

import { useState, useEffect } from "react";

interface Settings { companyName: string; pauseMessage: string; attendantName: string; notifyEmail?: string | null; plan: string; }

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => { if (d.settings) setSettings(d.settings); }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pauseMessage: settings.pauseMessage, attendantName: settings.attendantName, notifyEmail: settings.notifyEmail || null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-32 mt-8"><p className="text-gray-400 text-sm">Carregando...</p></div>;
  if (!settings) return <div className="p-8"><div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-6"><p className="text-yellow-700 text-sm">Conta não configurada.</p></div></div>;

  const field = (label: string, hint: string, children: React.ReactNode) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      {children}
    </div>
  );

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1 text-sm">{settings.companyName} · Plano {settings.plan}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        {field("Mensagem de ausência", "Enviada automaticamente quando o agente está pausado.",
          <textarea value={settings.pauseMessage} onChange={(e) => setSettings({ ...settings, pauseMessage: e.target.value })} rows={3}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        )}
        {field("Nome do atendente humano", "Exibido nas mensagens enviadas manualmente pelo dashboard.",
          <input type="text" value={settings.attendantName} onChange={(e) => setSettings({ ...settings, attendantName: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        )}
        {field("Email de notificação", "Receba um email quando uma mensagem chegar em modo humano.",
          <input type="email" value={settings.notifyEmail || ""} onChange={(e) => setSettings({ ...settings, notifyEmail: e.target.value })}
            placeholder="seu@email.com" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">✓ Salvo com sucesso!</span>}
        </div>
      </div>
    </div>
  );
}
