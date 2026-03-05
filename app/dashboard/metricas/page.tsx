"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";

interface MetricsData {
    kpis: {
        totalConvs: number; openConvs: number; closedConvs: number;
        leadsTotal: number; leadsThisMonth: number; msgsTotal: number;
        msgsThisMonth: number; avgMsgsPerConv: number; conversionRate: number;
        humanModeConvs: number; botModeConvs: number;
        whatsappMsgs: number | null; zaiaTotal: number | null;
    };
    charts: {
        msgsLast30: { date: string; label: string; count: number }[];
        leadFunnel: { name: string; value: number; fill: string }[];
        convStatus: { name: string; value: number; fill: string }[];
        botVsHuman: { name: string; value: number; fill: string }[];
    };
    companyName: string;
    plan: string;
}

function SkeletonCard() {
    return <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"><div className="h-4 bg-gray-200 rounded w-24 mb-3" /><div className="h-8 bg-gray-200 rounded w-16" /></div>;
}

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

export default function MetricasPage() {
    const [data, setData] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const clientId = searchParams.get("clientId");
    const qp = clientId ? `?clientId=${clientId}` : "";

    useEffect(() => {
        fetch(`/api/metrics${qp}`)
            .then((r) => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, [qp]);

    if (loading) return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="h-8 bg-gray-200 rounded w-40 animate-pulse" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}</div>
            <div className="grid grid-cols-2 gap-4">{[1, 2].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />)}</div>
            <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
    );

    if (!data) return <div className="p-8 text-red-500">Erro ao carregar métricas.</div>;

    const { kpis, charts } = data;

    const kpiCards = [
        { label: "Total de Conversas", value: kpis.totalConvs.toLocaleString("pt-BR"), icon: "💬", sub: `${kpis.openConvs} abertas` },
        { label: "Total de Leads", value: kpis.leadsTotal.toLocaleString("pt-BR"), icon: "👥", sub: `${kpis.leadsThisMonth} este mês` },
        { label: "Total de Mensagens", value: kpis.msgsTotal.toLocaleString("pt-BR"), icon: "📨", sub: `${kpis.msgsThisMonth} este mês` },
        { label: "Taxa de Conversão", value: `${kpis.conversionRate}%`, icon: "🎯", sub: "Leads → Convertidos" },
        { label: "Média Msgs/Conversa", value: kpis.avgMsgsPerConv.toString(), icon: "📊", sub: "por atendimento" },
        { label: "Em modo humano agora", value: kpis.humanModeConvs.toString(), icon: "👤", sub: `${kpis.botModeConvs} no bot` },
        { label: "Msgs WhatsApp (mês)", value: kpis.whatsappMsgs !== null ? kpis.whatsappMsgs.toLocaleString("pt-BR") : "—", icon: "📲", sub: "via WhatsApp" },
        { label: "Conversas Encerradas", value: kpis.closedConvs.toLocaleString("pt-BR"), icon: "✅", sub: "resolvidas" },
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">📊 Métricas</h1>
                <p className="text-gray-500 mt-0.5 text-sm">{data.companyName} · Plano {data.plan} · Visão completa de desempenho</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((k) => (
                    <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                        <div className="text-xl mb-2">{k.icon}</div>
                        <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{k.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
                    </div>
                ))}
            </div>

            {/* Line chart — Messages per day 30d */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-1">📈 Volume de Mensagens — últimos 30 dias</p>
                <p className="text-xs text-gray-400 mb-4">Mensagens trocadas por dia no período</p>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={charts.msgsLast30} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={4} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                        <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
                            formatter={(v: unknown) => [v, "Mensagens"]}
                        />
                        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Pie charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Lead Funnel */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-1">👥 Funil de Leads</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={charts.leadFunnel} cx="50%" cy="50%" innerRadius={40} outerRadius={75}
                                labelLine={false} label={renderLabel} dataKey="value">
                                {charts.leadFunnel.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Pie>
                            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                            <Tooltip formatter={(v: unknown) => [v, "Leads"]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Conv Status */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-1">📂 Status das Conversas</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={charts.convStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={75}
                                labelLine={false} label={renderLabel} dataKey="value">
                                {charts.convStatus.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Pie>
                            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                            <Tooltip formatter={(v: unknown) => [v, "Conversas"]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bot vs Human */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-1">🤖 Bot vs Humano</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={charts.botVsHuman} cx="50%" cy="50%" innerRadius={40} outerRadius={75}
                                labelLine={false} label={renderLabel} dataKey="value">
                                {charts.botVsHuman.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Pie>
                            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                            <Tooltip formatter={(v: unknown) => [v, "Conversas"]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bar chart lead funnel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-1">🎯 Progressão do Funil de Leads</p>
                <p className="text-xs text-gray-400 mb-4">Volume em cada etapa do funil de conversão</p>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={charts.leadFunnel} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#64748b" }} width={70} />
                        <Tooltip formatter={(v: unknown) => [v, "Leads"]} contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {charts.leadFunnel.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
