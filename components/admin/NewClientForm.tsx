"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
    onCreated: () => void;
    onCancel: () => void;
}

export default function NewClientForm({ onCreated, onCancel }: Props) {
    const [form, setForm] = useState({
        email: "",
        companyName: "",
        zaiaAgentId: "",
        zaiaApiKey: "",
        plan: "basic",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const set = (key: string, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/admin/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        if (res.ok) {
            onCreated();
        } else {
            setError(data.error ?? "Erro ao criar cliente");
            setLoading(false);
        }
    };

    const inputCls =
        "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm transition";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Email do cliente *
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="cliente@empresa.com.br"
                        required
                        className={inputCls}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        O cliente já deve ter se cadastrado em /login antes.
                    </p>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Nome da empresa *
                    </label>
                    <input
                        type="text"
                        value={form.companyName}
                        onChange={(e) => set("companyName", e.target.value)}
                        placeholder="Ex: Clínica São Lucas"
                        required
                        className={inputCls}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Zaia Agent ID *
                    </label>
                    <input
                        type="text"
                        value={form.zaiaAgentId}
                        onChange={(e) => set("zaiaAgentId", e.target.value)}
                        placeholder="Ex: 12345"
                        required
                        className={inputCls}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Plano
                    </label>
                    <select
                        value={form.plan}
                        onChange={(e) => set("plan", e.target.value)}
                        title="Plano do cliente"
                        className={inputCls}
                    >
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Zaia API Key *
                    </label>
                    <input
                        type="password"
                        value={form.zaiaApiKey}
                        onChange={(e) => set("zaiaApiKey", e.target.value)}
                        placeholder="zaia_••••••••••••••••••••"
                        required
                        className={inputCls}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Em platform.zaia.app → Gerenciar API Keys → Gerar nova chave.
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-xl bg-red-950 border border-red-800 px-4 py-3 text-red-300 text-sm">
                    ⚠️ {error}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                    {loading ? "Criando..." : "Criar cliente"}
                </button>
            </div>
        </form>
    );
}
