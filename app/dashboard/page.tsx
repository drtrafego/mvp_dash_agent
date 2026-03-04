import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { zaiaAPI } from "@/lib/zaia";
import StatsCard from "@/components/dashboard/StatsCard";
import AgentModeControl from "@/components/dashboard/AgentModeControl";
import { getUserClient } from "@/lib/db-helper";
import Link from "next/link";

export default async function DashboardPage(props: { searchParams: Promise<{ clientId?: string }> }) {
  const searchParams = await props.searchParams;
  const user = await stackServerApp.getUser();
  if (!user) return null;

  const client = await getUserClient(user.id, user.primaryEmail, searchParams.clientId);

  if (!client) {
    return (
      <div className="p-8">
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-6">
          <h2 className="text-base font-semibold text-yellow-800">Conta não configurada</h2>
          <p className="text-yellow-700 mt-1 text-sm">
            Entre em contato com a agência para vincular seu agente ao dashboard.
          </p>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [msgsToday, openConversations, leadsThisMonth, totalConvs, zaiaUsage] = await Promise.all([
    db.message.count({ where: { conversation: { clientId: client.id }, timestamp: { gte: today } } }),
    db.conversation.count({ where: { clientId: client.id, status: "open" } }),
    db.lead.count({ where: { clientId: client.id, createdAt: { gte: monthStart } } }),
    db.conversation.count({ where: { clientId: client.id } }),
    zaiaAPI.getUsage(client.zaiaApiKey).catch(() => null),
  ]);

  // Only show external messages count (WhatsApp usage) - no limits/credits/agent count
  const extMsgs = zaiaUsage?.usage?.externalGenerativeMessages?.count ?? null;

  const clientId = searchParams.clientId;
  const qp = clientId ? `?clientId=${clientId}` : "";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">{client.companyName} · Plano {client.plan}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Modo do Agente</p>
        <AgentModeControl clientId={clientId} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Mensagens Hoje" value={msgsToday} color="purple" icon="💬" />
        <StatsCard title="Conversas Abertas" value={openConversations} color="blue" icon="📂" />
        <StatsCard title="Leads (mês)" value={leadsThisMonth} color="green" icon="👥" />
        <StatsCard
          title="Msgs WhatsApp (mês)"
          value={extMsgs !== null ? extMsgs : "—"}
          color="orange"
          icon="📲"
        />
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: `/dashboard/inbox${qp}`, icon: "💬", title: "Inbox", desc: `${openConversations} conversas abertas` },
          { href: `/dashboard/bot${qp}`, icon: "🤖", title: "Personalizar Bot", desc: "Nome, voz, saudação" },
          { href: `/dashboard/followup${qp}`, icon: "📅", title: "Follow Up", desc: "Mensagens automáticas" },
          { href: `/dashboard/leads${qp}`, icon: "👥", title: "Leads", desc: `${leadsThisMonth} capturados este mês` },
          { href: `/dashboard/settings${qp}`, icon: "⚙️", title: "Configurações", desc: "Conta e notificações" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{item.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}


