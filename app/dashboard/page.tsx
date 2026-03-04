import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { zaiaAPI } from "@/lib/zaia";
import { redirect } from "next/navigation";
import StatsCard from "@/components/dashboard/StatsCard";
import AgentModeControl from "@/components/dashboard/AgentModeControl";

export default async function DashboardPage() {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/login");

  const client = await db.client.findUnique({ where: { stackUserId: user.id } });

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

  const [msgsToday, openConversations, leadsThisMonth, zaiaUsage] = await Promise.all([
    db.message.count({ where: { conversation: { clientId: client.id }, timestamp: { gte: today } } }),
    db.conversation.count({ where: { clientId: client.id, status: "open" } }),
    db.lead.count({ where: { clientId: client.id, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    zaiaAPI.getUsage(client.zaiaApiKey).catch(() => null),
  ]);

  const gen = zaiaUsage?.usage?.generativeMessages;
  const pct = gen ? Math.round((gen.count / gen.limit) * 100) : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">{client.companyName} · Plano {client.plan}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Modo do Agente</p>
        <AgentModeControl />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Mensagens Hoje" value={msgsToday} color="purple" icon="💬" />
        <StatsCard title="Conversas Abertas" value={openConversations} color="blue" icon="📂" />
        <StatsCard title="Leads Capturados (mês)" value={leadsThisMonth} color="green" icon="👥" />
        <StatsCard
          title="Créditos Usados"
          value={gen ? `${gen.count} / ${gen.limit}` : "—"}
          subtitle={gen ? `${gen.balance} restantes` : undefined}
          color={pct > 80 ? "orange" : "blue"}
          icon="⚡"
        />
        {zaiaUsage?.usage?.externalGenerativeMessages && (
          <StatsCard
            title="Msgs Externas"
            value={`${zaiaUsage.usage.externalGenerativeMessages.count} / ${zaiaUsage.usage.externalGenerativeMessages.limit}`}
            subtitle={`${zaiaUsage.usage.externalGenerativeMessages.balance} restantes`}
            color="gray"
            icon="📡"
          />
        )}
        {zaiaUsage?.usage?.agents && (
          <StatsCard
            title="Agentes"
            value={`${zaiaUsage.usage.agents.count} / ${zaiaUsage.usage.agents.limit}`}
            color="gray"
            icon="🤖"
          />
        )}
      </div>
    </div>
  );
}
