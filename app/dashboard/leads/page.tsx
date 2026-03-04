"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Lead { id: string; name?: string | null; phone: string; email?: string | null; status: string; createdAt: string; }

const statusCfg: Record<string, { label: string; cls: string }> = {
  new: { label: "Novo", cls: "bg-blue-100 text-blue-700" },
  qualified: { label: "Qualificado", cls: "bg-yellow-100 text-yellow-700" },
  converted: { label: "Convertido", cls: "bg-green-100 text-green-700" },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");

  useEffect(() => {
    const url = `/api/leads${clientId ? `?clientId=${clientId}` : ""}`;
    fetch(url).then((r) => r.json()).then((d) => setLeads(d.leads ?? [])).finally(() => setLoading(false));
  }, [clientId]);

  const updateStatus = async (id: string, status: string) => {
    const url = `/api/leads/${id}${clientId ? `?clientId=${clientId}` : ""}`;
    await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-500 mt-1 text-sm">Contatos capturados automaticamente nas conversas</p>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        : leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-500 font-medium">Nenhum lead capturado ainda</p>
            <p className="text-sm text-gray-400 mt-1">Detectados automaticamente quando alguém pergunta sobre preço, planos, compra, etc.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Nome", "Telefone", "Status", "Data", "Ação"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => {
                  const cfg = statusCfg[lead.status] ?? { label: lead.status, cls: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{lead.name || "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{lead.phone}</td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          title="Status do lead"
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${cfg.cls}`}
                        >
                          <option value="new">Novo</option>
                          <option value="qualified">Qualificado</option>
                          <option value="converted">Convertido</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(lead.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/inbox${clientId ? `?clientId=${clientId}` : ""}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">Ver conversa →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
