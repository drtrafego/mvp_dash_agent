"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface FollowUp {
    id: string;
    sessionId: string;
    message: string;
    delayMinutes: number;
    status?: string;
    createdAt?: string;
}

export default function FollowUpPage() {
    const [followUps, setFollowUps] = useState<FollowUp[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ sessionId: "", message: "", delayMinutes: 60 });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const searchParams = useSearchParams();
    const clientId = searchParams.get("clientId");
    const qp = clientId ? `?clientId=${clientId}` : "";

    const fetchFollowUps = useCallback(async () => {
        try {
            const res = await fetch(`/api/followup${qp}`);
            if (res.ok) {
                const data = await res.json();
                setFollowUps(data.followUps ?? data.data ?? []);
            }
        } catch { /* silent */ }
        setLoading(false);
    }, [qp]);

    useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError("");
        try {
            const res = await fetch(`/api/followup${qp}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setForm({ sessionId: "", message: "", delayMinutes: 60 });
                setShowForm(false);
                fetchFollowUps();
            } else {
                const d = await res.json();
                setError(d.error ?? "Erro ao criar follow-up");
            }
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/followup/${id}${qp}`, { method: "DELETE" });
        setFollowUps((prev) => prev.filter((f) => f.id !== id));
    };

    const formatDelay = (mins: number) => {
        if (mins < 60) return `${mins} min`;
        if (mins < 1440) return `${Math.round(mins / 60)}h`;
        return `${Math.round(mins / 1440)} dia(s)`;
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📅 Follow Up</h1>
                    <p className="text-gray-500 mt-1 text-sm">Mensagens automáticas de retorno após silêncio nas conversas</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${showForm
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    {showForm ? "Cancelar" : "+ Novo Follow Up"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 text-sm">Criar novo follow-up</h2>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            ID da conversa / sessão *
                        </label>
                        <input
                            type="text"
                            title="ID da sessão de conversa"
                            placeholder="Ex: 5511999999999"
                            value={form.sessionId}
                            onChange={(e) => setForm((p) => ({ ...p, sessionId: e.target.value }))}
                            required
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Geralmente o número de WhatsApp do contato</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Mensagem *
                        </label>
                        <textarea
                            title="Mensagem de follow-up"
                            placeholder="Ex: Olá! Ainda posso te ajudar com algo? 😊"
                            value={form.message}
                            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                            rows={3}
                            required
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Aguardar (em minutos) *
                        </label>
                        <input
                            type="number"
                            title="Delay em minutos"
                            min={1}
                            value={form.delayMinutes}
                            onChange={(e) => setForm((p) => ({ ...p, delayMinutes: Number(e.target.value) }))}
                            required
                            className="w-40 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-400">{formatDelay(form.delayMinutes)}</span>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button type="submit" disabled={creating}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                            {creating ? "Criando..." : "Criar follow-up"}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="text-center py-16 text-gray-400 text-sm">Carregando follow-ups...</div>
            ) : followUps.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-300 rounded-2xl">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="text-gray-500 font-medium">Nenhum follow-up configurado</p>
                    <p className="text-sm text-gray-400 mt-1">Crie follow-ups para reengajar contatos que pararam de responder.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {followUps.map((fu) => (
                        <div key={fu.id} className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            📱 {fu.sessionId}
                                        </span>
                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                                            ⏰ {formatDelay(fu.delayMinutes)}
                                        </span>
                                        {fu.status && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fu.status === "pending" ? "bg-yellow-50 text-yellow-600" :
                                                    fu.status === "sent" ? "bg-green-50 text-green-600" :
                                                        "bg-gray-100 text-gray-500"
                                                }`}>
                                                {fu.status}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{fu.message}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(fu.id)}
                                    className="text-red-400 hover:text-red-600 transition-colors text-sm flex-shrink-0"
                                    title="Remover follow-up"
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
                💡 <strong>Como funciona:</strong> Após o tempo configurado sem resposta do contato, o bot envia automaticamente a mensagem de follow-up pelo WhatsApp.
            </div>
        </div>
    );
}
