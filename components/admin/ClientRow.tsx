"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Client {
    id: string;
    companyName: string;
    email?: string | null;
    zaiaAgentId: string;
    zaiaApiKey?: string;
    plan: string;
    active: boolean;
    notifyEmail?: string | null;
    notifyEmails?: string; // JSON array string
    createdAt: string;
    _count: { conversations: number; leads: number };
}

interface Props {
    client: Client;
    onUpdated: () => void;
    onDeleted: () => void;
}

const planColors: Record<string, string> = {
    basic: "bg-gray-700 text-gray-300",
    pro: "bg-violet-900 text-violet-300",
    enterprise: "bg-amber-900 text-amber-300",
};

export default function ClientRow({ client, onUpdated, onDeleted }: Props) {
    const [expanded, setExpanded] = useState(false);

    // Edit fields
    const [editName, setEditName] = useState(client.companyName);
    const [editEmail, setEditEmail] = useState(client.email ?? "");
    const [editAgentId, setEditAgentId] = useState(client.zaiaAgentId);
    const [editApiKey, setEditApiKey] = useState("");
    const [editPlan, setEditPlan] = useState(client.plan);
    const [editActive, setEditActive] = useState(client.active);
    const [editNotifyEmails, setEditNotifyEmails] = useState<string[]>(() => {
        try { return JSON.parse(client.notifyEmails ?? "[]"); } catch { return []; }
    });
    const [newEmail, setNewEmail] = useState("");

    // Credit usage
    const [usage, setUsage] = useState<{ generativeCount: number | null; externalCount: number | null } | null>(null);
    const [loadingUsage, setLoadingUsage] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (expanded && usage === null) {
            setLoadingUsage(true);
            fetch(`/api/admin/clients/${client.id}/usage`)
                .then((r) => r.json())
                .then(setUsage)
                .catch(() => { })
                .finally(() => setLoadingUsage(false));
        }
    }, [expanded, client.id, usage]);

    const handleAddEmail = () => {
        const trimmed = newEmail.trim().toLowerCase();
        if (!trimmed || editNotifyEmails.includes(trimmed)) return;
        setEditNotifyEmails((prev) => [...prev, trimmed]);
        setNewEmail("");
    };

    const handleRemoveEmail = (email: string) => {
        setEditNotifyEmails((prev) => prev.filter((e) => e !== email));
    };

    const handleSave = async () => {
        setSaving(true);
        await fetch(`/api/admin/clients/${client.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                companyName: editName,
                email: editEmail || null,
                zaiaAgentId: editAgentId,
                plan: editPlan,
                active: editActive,
                notifyEmails: editNotifyEmails,
                ...(editApiKey ? { zaiaApiKey: editApiKey } : {}),
            }),
        });
        setSaving(false);
        setEditApiKey("");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        onUpdated();
    };

    const handleDelete = async () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        setDeleting(true);
        await fetch(`/api/admin/clients/${client.id}`, { method: "DELETE" });
        onDeleted();
    };

    return (
        <div className={`rounded-2xl border transition-colors ${editActive ? "border-gray-700 bg-gray-900" : "border-gray-800 bg-gray-900/50 opacity-60"}`}>
            {/* Row principal */}
            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white">{client.companyName}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${planColors[client.plan] ?? planColors.basic}`}>
                            {client.plan}
                        </span>
                        {!client.active && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-950 text-red-400 font-medium">INATIVO</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-gray-500">Agent ID: {client.zaiaAgentId}</p>
                        {client.email && <p className="text-xs text-gray-600">· {client.email}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-5 text-center shrink-0">
                    <Link
                        href={`/dashboard?clientId=${client.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-[11px] font-semibold transition-colors border border-gray-700"
                    >
                        <span>👁️</span> Visualizar
                    </Link>
                    <div className="hidden sm:block">
                        <p className="text-sm font-bold text-white">{client._count.conversations}</p>
                        <p className="text-[10px] text-gray-500">Convs</p>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-bold text-white">{client._count.leads}</p>
                        <p className="text-[10px] text-gray-500">Leads</p>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-[11px] text-gray-500">{new Date(client.createdAt).toLocaleDateString("pt-BR")}</p>
                        <p className="text-[10px] text-gray-600">Criado em</p>
                    </div>
                    <span className="text-gray-500 text-sm">{expanded ? "▲" : "▼"}</span>
                </div>
            </div>

            {/* Painel de edição */}
            {expanded && (
                <div className="border-t border-gray-800 px-5 py-5 space-y-5">

                    {/* Consumo de créditos */}
                    <div className="rounded-xl bg-gray-800/60 border border-gray-700 px-4 py-3 flex items-center gap-6">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Consumo (mês)</span>
                        {loadingUsage ? (
                            <span className="text-xs text-gray-500 animate-pulse">Buscando...</span>
                        ) : usage ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">📲</span>
                                    <div>
                                        <p className="text-sm font-bold text-white">{usage.externalCount ?? "—"}</p>
                                        <p className="text-[10px] text-gray-500">Msgs WhatsApp</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">🤖</span>
                                    <div>
                                        <p className="text-sm font-bold text-white">{usage.generativeCount ?? "—"}</p>
                                        <p className="text-[10px] text-gray-500">Msgs IA</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <span className="text-xs text-gray-600">Indisponível</span>
                        )}
                    </div>

                    {/* Dados da empresa */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dados da Empresa</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Nome da empresa</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    title="Nome da empresa"
                                    placeholder="Nome da empresa"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">E-mail de login</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    title="E-mail de login do cliente"
                                    placeholder="cliente@email.com"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Agent ID (Zaia)</label>
                                <input
                                    type="text"
                                    value={editAgentId}
                                    onChange={(e) => setEditAgentId(e.target.value)}
                                    title="ID do agente na Zaia"
                                    placeholder="ex: 12345"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Nova API Key (opcional)</label>
                                <input
                                    type="password"
                                    value={editApiKey}
                                    onChange={(e) => setEditApiKey(e.target.value)}
                                    placeholder="Deixe vazio para manter"
                                    title="Nova API Key da Zaia"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Plano e status */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Plano e Status</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Plano</label>
                                <select
                                    value={editPlan}
                                    onChange={(e) => setEditPlan(e.target.value)}
                                    title="Plano do cliente"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                >
                                    <option value="basic">Basic</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Status</label>
                                <select
                                    value={editActive ? "active" : "inactive"}
                                    onChange={(e) => setEditActive(e.target.value === "active")}
                                    title="Status do cliente"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                >
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* E-mails de notificação */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            E-mails de Notificação
                            <span className="ml-2 text-gray-600 font-normal normal-case">({editNotifyEmails.length} cadastrado{editNotifyEmails.length !== 1 ? "s" : ""})</span>
                        </p>
                        <div className="space-y-1.5 mb-3">
                            {editNotifyEmails.length === 0 && (
                                <p className="text-xs text-gray-600 italic">Nenhum e-mail de notificação cadastrado</p>
                            )}
                            {editNotifyEmails.map((em) => (
                                <div key={em} className="flex items-center justify-between bg-gray-800 rounded-xl px-3 py-2 border border-gray-700">
                                    <span className="text-sm text-gray-200">{em}</span>
                                    <button
                                        onClick={() => handleRemoveEmail(em)}
                                        className="text-gray-500 hover:text-red-400 text-sm ml-3 transition-colors"
                                        title="Remover e-mail"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                                placeholder="adicionar@email.com"
                                title="Novo e-mail de notificação"
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                            <button
                                onClick={handleAddEmail}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl text-sm font-medium transition-colors"
                            >
                                + Adicionar
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className={`text-sm font-medium transition-colors ${confirmDelete ? "text-red-400 hover:text-red-300" : "text-gray-500 hover:text-red-400"}`}
                            >
                                {deleting ? "Removendo..." : confirmDelete ? "⚠️ Confirmar remoção" : "🗑 Remover cliente"}
                            </button>
                            {confirmDelete && !deleting && (
                                <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500 hover:text-gray-300">
                                    Cancelar
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {saved && <span className="text-xs text-green-400 font-medium">✓ Salvo!</span>}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
                            >
                                {saving ? "Salvando..." : "Salvar alterações"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
