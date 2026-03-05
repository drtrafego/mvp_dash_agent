import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { stackServerApp } from "@/stack";

// GET /api/admin/clients — lista todos os clientes
export async function GET(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const clients = await db.client.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            email: true,
            stackUserId: true,
            companyName: true,
            zaiaAgentId: true,
            plan: true,
            active: true,
            notifyEmail: true,
            notifyEmails: true,
            createdAt: true,
            _count: { select: { conversations: true, leads: true } },
        },
    });

    return NextResponse.json({ clients });
}

// POST /api/admin/clients — cria novo cliente
export async function POST(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { email, companyName, zaiaAgentId, zaiaApiKey, plan } = await req.json();

    if (!email || !companyName || !zaiaAgentId || !zaiaApiKey) {
        return NextResponse.json({ error: "Campos obrigatórios: email, companyName, zaiaAgentId, zaiaApiKey" }, { status: 400 });
    }

    // Verifica se já existe um Client para esse email ou agente
    const existing = await db.client.findFirst({
        where: { OR: [{ email }, { zaiaAgentId }] },
    });
    if (existing) {
        return NextResponse.json(
            { error: "Já existe um cliente com esse email ou agente Zaia." },
            { status: 409 }
        );
    }

    const client = await db.client.create({
        data: {
            email,
            companyName,
            zaiaAgentId,
            zaiaApiKey,
            plan: plan ?? "basic",
        },
    });

    return NextResponse.json({ client }, { status: 201 });
}

