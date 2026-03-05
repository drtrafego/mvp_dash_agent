import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// PATCH /api/admin/clients/[id] — atualiza cliente
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { id } = await params;
    const { companyName, email, zaiaApiKey, zaiaAgentId, plan, active, pauseMessage, attendantName, notifyEmail, notifyEmails } = await req.json();

    const client = await db.client.update({
        where: { id },
        data: {
            ...(companyName !== undefined && { companyName }),
            ...(email !== undefined && { email: email || null }),
            ...(zaiaApiKey !== undefined && { zaiaApiKey }),
            ...(zaiaAgentId !== undefined && { zaiaAgentId }),
            ...(plan !== undefined && { plan }),
            ...(active !== undefined && { active }),
            ...(pauseMessage !== undefined && { pauseMessage }),
            ...(attendantName !== undefined && { attendantName }),
            ...(notifyEmail !== undefined && { notifyEmail: notifyEmail || null }),
            ...(notifyEmails !== undefined && { notifyEmails: JSON.stringify(Array.isArray(notifyEmails) ? notifyEmails : []) }),
        },
    });

    return NextResponse.json({ client });
}

// DELETE /api/admin/clients/[id] — remove cliente e todos os dados relacionados
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { id } = await params;

    // Remove mensagens → conversas → leads → cliente (ordem por FK)
    const conversations = await db.conversation.findMany({ where: { clientId: id }, select: { id: true } });
    const convIds = conversations.map((c: { id: string }) => c.id);

    await db.message.deleteMany({ where: { conversationId: { in: convIds } } });
    await db.conversation.deleteMany({ where: { clientId: id } });
    await db.lead.deleteMany({ where: { clientId: id } });
    await db.client.delete({ where: { id } });

    return NextResponse.json({ ok: true });
}
