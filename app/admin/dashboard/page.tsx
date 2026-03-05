"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NewClientForm from "@/components/admin/NewClientForm";
import ClientRow from "@/components/admin/ClientRow";

interface Client {
    id: string;
    companyName: string;
    email?: string | null;
    zaiaAgentId: string;
    plan: string;
    active: boolean;
    notifyEmail?: string | null;
    notifyEmails?: string;
    createdAt: string;
    _count: { conversations: number; leads: number };
}

export default function AdminDashboardPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const router = useRouter();

    const fetchClients = useCallback(async () => {
        const res = await fetch("/api/admin/clients");
        if (res.status === 401) { router.push("/admin"); return; }
        const data = await res.json();
        setClients(data.clients ?? []);
        setLoading(false);
    }, [router]);

    useEffect(() => { fetchClients(); }, [fetchClients]);

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin");
    };

    const totalConvs = clients.reduce((n, c) => n + c._count.conversations, 0);
    const totalLeads = clients.reduce((n, c) => n + c._count.leads, 0);
    const activeClients = clients.filter((c) => c.active).length;

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <h1 className="font-bold text-white text-sm">Painel Admin</h1>
                            <p className="text-xs text-gray-500">Gestão de clientes</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
                    >
                        Sair
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8">

                {/* Stats rápidas */}
                {!loading && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { label: "Clientes ativos", value: activeClients, icon: "👥" },
                            { label: "Total conversas", value: totalConvs, icon: "💬" },
                            { label: "Total leads", value: totalLeads, icon: "🎯" },
                        ].map((s) => (
                            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4">
                                <p className="text-2xl mb-1">{s.icon}</p>
                                <p className="text-2xl font-bold text-white">{s.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Título + botão novo cliente */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white">
                        Clientes {!loading && <span className="text-gray-500 font-normal text-sm ml-1">({clients.length})</span>}
                    </h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${showForm
                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            : "bg-violet-600 hover:bg-violet-700 text-white"
                            }`}
                    >
                        {showForm ? "Cancelar" : "+ Novo cliente"}
                    </button>
                </div>

                {/* Formulário de novo cliente */}
                {showForm && (
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
                        <h3 className="font-semibold text-white mb-4">Cadastrar novo cliente</h3>
                        <NewClientForm
                            onCreated={() => { setShowForm(false); fetchClients(); }}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                )}

                {/* Lista de clientes */}
                {loading ? (
                    <div className="text-center py-16 text-gray-500 text-sm">Carregando clientes...</div>
                ) : clients.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
                        <p className="text-4xl mb-3">👥</p>
                        <p className="text-gray-400 font-medium">Nenhum cliente cadastrado</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Clique em "+ Novo cliente" para começar.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {clients.map((client) => (
                            <ClientRow
                                key={client.id}
                                client={client}
                                onUpdated={fetchClients}
                                onDeleted={fetchClients}
                            />
                        ))}
                    </div>
                )}

                {/* Instruções */}
                <div className="mt-10 bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">📋 Como adicionar um cliente</h3>
                    <ol className="text-sm text-gray-500 space-y-1.5 list-decimal list-inside">
                        <li>Crie o agente na <strong className="text-gray-400">Zaia</strong> e copie o Agent ID e a API Key</li>
                        <li>Peça ao cliente para criar a conta em <code className="bg-gray-800 px-1 rounded text-violet-400">/login</code> usando o email dele</li>
                        <li>Clique em "+ Novo cliente" e preencha o formulário</li>
                        <li>Pronto — o cliente já acessa o dashboard com os dados do agente dele</li>
                    </ol>
                </div>

            </div>
        </div>
    );
}
