"use client";

import { useState } from "react";
import Link from "next/link";

interface Client {
    id: string;
    companyName: string;
    zaiaAgentId: string;
    plan: string;
    active: boolean;
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
    const [editPlan, setEditPlan] = useState(client.plan);
    const [editActive, setEditActive] = useState(client.active);
    const [editApiKey, setEditApiKey] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await fetch(`/api/admin/clients/${client.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                plan: editPlan,
                active: editActive,
                ...(editApiKey ? { zaiaApiKey: editApiKey } : {}),
            }),
        });
        setSaving(false);
        setEditApiKey("");
        setExpanded(false);
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
            <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
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
                    <p className="text-xs text-gray-500 mt-0.5">Agent ID: {client.zaiaAgentId}</p>
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
                <div className="border-t border-gray-800 px-5 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Plano</label>
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
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
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
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Nova API Key (opcional)
                            </label>
                            <input
                                type="password"
                                value={editApiKey}
                                onChange={(e) => setEditApiKey(e.target.value)}
                                placeholder="Deixe vazio para manter"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className={`text-sm font-medium transition-colors ${confirmDelete ? "text-red-400 hover:text-red-300" : "text-gray-500 hover:text-red-400"}`}
                        >
                            {deleting ? "Removendo..." : confirmDelete ? "⚠️ Confirmar remoção" : "🗑 Remover cliente"}
                        </button>
                        {confirmDelete && !deleting && (
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="text-xs text-gray-500 hover:text-gray-300 ml-3"
                            >
                                Cancelar
                            </button>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
                        >
                            {saving ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
