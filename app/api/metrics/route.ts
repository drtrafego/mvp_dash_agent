import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { getUserClient } from "@/lib/db-helper";
import { zaiaAPI } from "@/lib/zaia";

export async function GET(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const clientId = req.nextUrl.searchParams.get("clientId");
    const client = await getUserClient(user.id, user.primaryEmail, clientId);
    if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now); today.setHours(0, 0, 0, 0);

    // Last 30 days labels
    const last30 = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        return d;
    });

    const [
        totalConvs,
        openConvs,
        closedConvs,
        humanModeConvs,
        leadsTotal,
        leadsByStatus,
        leadsThisMonth,
        msgsTotal,
        msgsThisMonth,
        msgsPerDay30,
        zaiaUsage,
        zaiaChats,
    ] = await Promise.all([
        db.conversation.count({ where: { clientId: client.id } }),
        db.conversation.count({ where: { clientId: client.id, status: "open" } }),
        db.conversation.count({ where: { clientId: client.id, status: "closed" } }),
        db.conversation.count({ where: { clientId: client.id, mode: "humano" } }),
        db.lead.count({ where: { clientId: client.id } }),
        db.lead.groupBy({ by: ["status"], where: { clientId: client.id }, _count: { id: true } }),
        db.lead.count({ where: { clientId: client.id, createdAt: { gte: monthStart } } }),
        db.message.count({ where: { conversation: { clientId: client.id } } }),
        db.message.count({ where: { conversation: { clientId: client.id }, timestamp: { gte: monthStart } } }),
        // messages per day last 30 days
        Promise.all(last30.map(async (day) => {
            const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
            const count = await db.message.count({
                where: { conversation: { clientId: client.id }, timestamp: { gte: day, lt: nextDay } },
            });
            return {
                date: day.toISOString().slice(0, 10),
                label: day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                count,
            };
        })),
        zaiaAPI.getUsage(client.zaiaApiKey).catch(() => null),
        zaiaAPI.listZaiaChats(client.zaiaAgentId, client.zaiaApiKey, 100).catch(() => null),
    ]);

    // Lead funnel
    const leadFunnel: Record<string, number> = { new: 0, qualified: 0, converted: 0 };
    for (const row of leadsByStatus) {
        if (row.status in leadFunnel) leadFunnel[row.status] = row._count.id;
    }

    // Bot vs Human
    const botModeConvs = totalConvs - humanModeConvs;

    // Zaia external chat count (source of truth for total chats from Zaia side)
    const zaiaTotal = zaiaChats?.totalCount ?? null;

    // WhatsApp usage — safe filtered (no credits/limits)
    const whatsappMsgs = zaiaUsage?.usage?.externalGenerativeMessages?.count ?? null;

    // Avg messages per conversation
    const avgMsgsPerConv = totalConvs > 0 ? Math.round(msgsTotal / totalConvs) : 0;

    // Conversion rate
    const conversionRate = leadsTotal > 0 ? Math.round((leadFunnel.converted / leadsTotal) * 100) : 0;

    // Msgs per day — only last 14 for the overview chart (7 for overview, 30 for metrics)
    const msgsLast7 = msgsPerDay30.slice(-7);
    const msgsLast30 = msgsPerDay30;

    return Response.json({
        kpis: {
            totalConvs,
            openConvs,
            closedConvs,
            leadsTotal,
            leadsThisMonth,
            msgsTotal,
            msgsThisMonth,
            avgMsgsPerConv,
            conversionRate,
            humanModeConvs,
            botModeConvs,
            whatsappMsgs,
            zaiaTotal,
        },
        charts: {
            msgsLast7,
            msgsLast30,
            leadFunnel: [
                { name: "Novos", value: leadFunnel.new, fill: "#3b82f6" },
                { name: "Qualificados", value: leadFunnel.qualified, fill: "#f59e0b" },
                { name: "Convertidos", value: leadFunnel.converted, fill: "#22c55e" },
            ],
            convStatus: [
                { name: "Abertas", value: openConvs, fill: "#6366f1" },
                { name: "Fechadas", value: closedConvs, fill: "#94a3b8" },
            ],
            botVsHuman: [
                { name: "Bot", value: botModeConvs, fill: "#00c2ff" },
                { name: "Humano", value: humanModeConvs, fill: "#f59e0b" },
            ],
        },
        companyName: client.companyName,
        plan: client.plan,
    });
}
