"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AgentModeControl from "@/components/dashboard/AgentModeControl";
import Link from "next/link";

interface AnalyticsData {
  stats: { msgsToday: number; leadsThisMonth: number; openConvs: number; whatsappMsgsThisMonth: number | null };
  charts: {
    msgsPerDay: { date: string; count: number }[];
    conversationStatus: { open: number; closed: number };
    botVsHuman: { bot: number; human: number };
    leadFunnel: { new: number; qualified: number; converted: number };
  };
  totals: { allConversations: number; totalLeads: number };
  recentConvs: {
    id: string; contactName?: string | null; contactPhone: string;
    lastMessage?: string | null; lastMessageAt?: string | null;
    status: string; mode: string; unreadCount: number;
  }[];
  companyName: string;
  plan: string;
}

function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-16 mt-3">
      {data.map((d) => {
        const h = Math.max(Math.round((d.count / max) * 64), 4);
        const day = new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short" });
        return (
          <div key={d.date} className="flex flex-col items-center flex-1 gap-1" title={`${day}: ${d.count} msgs`}>
            <div
              className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600"
              style={{ height: `${h}px` }}
            />
            <span className="text-[10px] text-gray-400">{day}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutRing({ pct, color, label, value }: { pct: number; color: string; label: string; value: string }) {
  const r = 28; const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${circ}`} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">{value}</text>
      </svg>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

export default function DashboardOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const qp = clientId ? `?clientId=${clientId}` : "";

  useEffect(() => {
    fetch(`/api/analytics${qp}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [qp]);

  if (loading) return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}</div>
        <div className="grid grid-cols-2 gap-4">{[1, 2].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl" />)}</div>
      </div>
    </div>
  );

  if (!data || (data as unknown as { error: string }).error) return (
    <div className="p-8">
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-6">
        <h2 className="text-base font-semibold text-yellow-800">Conta não configurada</h2>
        <p className="text-yellow-700 mt-1 text-sm">Entre em contato com a agência para vincular seu agente ao dashboard.</p>
      </div>
    </div>
  );

  const { stats, charts, totals, recentConvs } = data;
  const botPct = totals.allConversations > 0 ? Math.round((charts.botVsHuman.bot / totals.allConversations) * 100) : 100;
  const openPct = totals.allConversations > 0 ? Math.round((charts.conversationStatus.open / totals.allConversations) * 100) : 0;
  const convPct = totals.totalLeads > 0 ? Math.round((charts.leadFunnel.converted / totals.totalLeads) * 100) : 0;

  const statCards = [
    { title: "Mensagens hoje", value: stats.msgsToday, icon: "💬", color: "bg-violet-50 border-violet-200 text-violet-700" },
    { title: "Conversas abertas", value: stats.openConvs, icon: "📂", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { title: "Leads este mês", value: stats.leadsThisMonth, icon: "👥", color: "bg-green-50 border-green-200 text-green-700" },
    { title: "Msgs WhatsApp (mês)", value: stats.whatsappMsgsThisMonth ?? "—", icon: "📲", color: "bg-orange-50 border-orange-200 text-orange-700" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-0.5 text-sm">{data.companyName} · Plano {data.plan}</p>
        </div>
      </div>

      {/* Agent mode */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Modo do Agente</p>
        <AgentModeControl clientId={clientId ?? undefined} />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.title} className={`rounded-2xl border p-5 ${s.color}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Messages per day */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-700">📈 Mensagens por dia — últimos 7 dias</p>
          <MiniBarChart data={charts.msgsPerDay} />
          <p className="text-xs text-gray-400 mt-2">
            Total no período: <strong>{charts.msgsPerDay.reduce((sum, d) => sum + d.count, 0)}</strong> mensagens
          </p>
        </div>

        {/* Donut stats */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-5">🔄 Indicadores</p>
          <div className="flex flex-col gap-5 items-center">
            <DonutRing pct={botPct} color="#6366f1" label="% em modo bot" value={`${botPct}%`} />
            <DonutRing pct={openPct} color="#3b82f6" label="% conversas abertas" value={`${openPct}%`} />
            <DonutRing pct={convPct} color="#22c55e" label="% leads convertidos" value={`${convPct}%`} />
          </div>
        </div>
      </div>

      {/* Lead funnel + recent convs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Lead funnel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">👥 Funil de Leads</p>
          {[
            { label: "Novos", count: charts.leadFunnel.new, color: "bg-blue-500", textColor: "text-blue-700" },
            { label: "Qualificados", count: charts.leadFunnel.qualified, color: "bg-yellow-400", textColor: "text-yellow-700" },
            { label: "Convertidos", count: charts.leadFunnel.converted, color: "bg-green-500", textColor: "text-green-700" },
          ].map((stage) => {
            const pct = totals.totalLeads > 0 ? Math.round((stage.count / totals.totalLeads) * 100) : 0;
            return (
              <div key={stage.label} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${stage.textColor}`}>{stage.label}</span>
                  <span className="text-sm font-bold text-gray-700">{stage.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${stage.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <Link href={`/dashboard/leads${qp}`} className="text-xs text-blue-600 hover:underline mt-3 block">
            Ver todos os leads →
          </Link>
        </div>

        {/* Recent conversations */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">💬 Conversas recentes</p>
            <Link href={`/dashboard/inbox${qp}`} className="text-xs text-blue-600 hover:underline">Ver inbox →</Link>
          </div>
          {recentConvs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhuma conversa ainda</p>
          ) : (
            <div className="space-y-3">
              {recentConvs.map((conv) => (
                <div key={conv.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0 font-semibold text-gray-500">
                    {(conv.contactName ?? conv.contactPhone)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {conv.contactName ?? conv.contactPhone}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium ${conv.mode === "humano" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                        }`}>
                        {conv.mode === "humano" ? "humano" : "bot"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage ?? "Sem mensagens"}</p>
                  </div>
                  {conv.lastMessageAt && (
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {new Date(conv.lastMessageAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Total de conversas", value: totals.allConversations },
          { label: "Total de leads", value: totals.totalLeads },
          { label: "Modo humano agora", value: charts.botVsHuman.human },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
