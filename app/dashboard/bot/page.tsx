"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface AgentConfig {
    publicName?: string;
    name?: string;
    openingMessage?: string;
    humanTransferMessage?: string;
    voiceTone?: string;
    language?: string;
    timezone?: string;
}

const tones = ["formal", "informal", "amigável", "profissional", "divertido"];
const languages = ["Português (BR)", "Português (PT)", "Inglês", "Espanhol"];

export default function BotPage() {
    const [config, setConfig] = useState<AgentConfig>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const searchParams = useSearchParams();
    const clientId = searchParams.get("clientId");
    const qp = clientId ? `?clientId=${clientId}` : "";

    useEffect(() => {
        fetch(`/api/agent/bot${qp}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.agent) setConfig(d.agent);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [qp]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`/api/agent/bot${qp}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    const set = (key: keyof AgentConfig, value: string) =>
        setConfig((prev) => ({ ...prev, [key]: value }));

    if (loading)
        return <div className="p-8 text-center text-gray-400 text-sm">Carregando configurações do bot...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">🤖 Personalizar Bot</h1>
                <p className="text-gray-500 mt-1 text-sm">Ajuste o nome, voz e mensagens do seu agente</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome público do agente</label>
                    <p className="text-xs text-gray-400 mb-2">Como o bot vai se apresentar nas conversas</p>
                    <input
                        type="text"
                        value={config.publicName ?? ""}
                        onChange={(e) => set("publicName", e.target.value)}
                        placeholder="Ex: Bia, João, Assistente Virtual..."
                        title="Nome público do agente"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem inicial</label>
                    <p className="text-xs text-gray-400 mb-2">Primeira mensagem enviada quando alguém inicia uma conversa</p>
                    <textarea
                        value={config.openingMessage ?? ""}
                        onChange={(e) => set("openingMessage", e.target.value)}
                        rows={3}
                        placeholder="Ex: Olá! Sou a Bia, assistente virtual. Como posso te ajudar?"
                        title="Mensagem inicial do agente"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de transferência humana</label>
                    <p className="text-xs text-gray-400 mb-2">Enviada quando o atendimento passa para um humano</p>
                    <textarea
                        value={config.humanTransferMessage ?? ""}
                        onChange={(e) => set("humanTransferMessage", e.target.value)}
                        rows={2}
                        placeholder="Ex: Vou te conectar com um de nossos atendentes. Um momento!"
                        title="Mensagem de transferência humana"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tom de voz</label>
                        <select
                            value={config.voiceTone ?? ""}
                            onChange={(e) => set("voiceTone", e.target.value)}
                            title="Tom de voz do agente"
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione...</option>
                            {tones.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                        <select
                            value={config.language ?? ""}
                            onChange={(e) => set("language", e.target.value)}
                            title="Idioma do agente"
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione...</option>
                            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {saving ? "Salvando..." : "Salvar alterações"}
                    </button>
                    {saved && <span className="text-sm text-green-600 font-medium">✓ Salvo com sucesso!</span>}
                </div>
            </div>

            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
                💡 <strong>Dica:</strong> As alterações aqui refletem diretamente no comportamento do seu agente nas conversas.
            </div>
        </div>
    );
}
