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
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Last 7 days array
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    const [
        msgsPerDay,
        allConversations,
        leadsByStatus,
        openConvs,
        closedConvs,
        humanModeConvs,
        recentConvs,
        leadsThisMonth,
        msgsToday,
        zaiaUsage,
    ] = await Promise.all([
        // messages per day for last 7 days
        Promise.all(last7.map(async (day) => {
            const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
            const count = await db.message.count({
                where: { conversation: { clientId: client.id }, timestamp: { gte: day, lt: nextDay } },
            });
            return { date: day.toISOString().slice(0, 10), count };
        })),
        // total conversations
        db.conversation.count({ where: { clientId: client.id } }),
        // leads by status
        db.lead.groupBy({ by: ["status"], where: { clientId: client.id }, _count: { id: true } }),
        // open conversations
        db.conversation.count({ where: { clientId: client.id, status: "open" } }),
        // closed conversations
        db.conversation.count({ where: { clientId: client.id, status: "closed" } }),
        // conversations in human mode
        db.conversation.count({ where: { clientId: client.id, mode: "humano" } }),
        // 5 most recent conversations
        db.conversation.findMany({
            where: { clientId: client.id },
            orderBy: { lastMessageAt: "desc" },
            take: 5,
            select: { id: true, contactName: true, contactPhone: true, lastMessage: true, lastMessageAt: true, status: true, mode: true, unreadCount: true },
        }),
        // leads this month
        db.lead.count({ where: { clientId: client.id, createdAt: { gte: monthStart } } }),
        // messages today
        db.message.count({ where: { conversation: { clientId: client.id }, timestamp: { gte: today } } }),
        // Zaia usage (WhatsApp messages count only)
        zaiaAPI.getUsage(client.zaiaApiKey).catch(() => null),
    ]);

    // Lead funnel
    const leadFunnel = {
        new: 0, qualified: 0, converted: 0,
    };
    for (const row of leadsByStatus) {
        const s = row.status as keyof typeof leadFunnel;
        if (s in leadFunnel) leadFunnel[s] = row._count.id;
    }

    const totalLeads = leadFunnel.new + leadFunnel.qualified + leadFunnel.converted;

    // Bot vs human ratio
    const botModeConvs = allConversations - humanModeConvs;

    // WhatsApp usage (no limit/credit/agent data)
    const whatsappMsgsThisMonth = zaiaUsage?.usage?.externalGenerativeMessages?.count ?? null;

    return Response.json({
        stats: {
            msgsToday,
            leadsThisMonth,
            openConvs,
            whatsappMsgsThisMonth,
        },
        charts: {
            msgsPerDay,
            conversationStatus: { open: openConvs, closed: closedConvs },
            botVsHuman: { bot: botModeConvs, human: humanModeConvs },
            leadFunnel,
        },
        totals: {
            allConversations,
            totalLeads,
        },
        recentConvs,
        companyName: client.companyName,
        plan: client.plan,
    });
}
