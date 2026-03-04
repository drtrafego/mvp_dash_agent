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
            stackUserId: true,
            companyName: true,
            zaiaAgentId: true,
            plan: true,
            active: true,
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

    // Busca o usuário pelo email no Stack Auth
    let stackUserId: string;
    try {
        const result = await stackServerApp.listUsers();
        // Stack Auth returns ServerUser[] (array-like with nextCursor) — treat as array
        const users = Array.from(result) as { id: string; primaryEmail: string | null }[];
        const found = users.find((u) => u.primaryEmail === email);
        if (!found) {
            return NextResponse.json(
                { error: `Usuário com email "${email}" não encontrado no Stack Auth. O cliente precisa se cadastrar primeiro em /login.` },
                { status: 404 }
            );
        }
        stackUserId = found.id;
    } catch {
        return NextResponse.json({ error: "Erro ao buscar usuário no Stack Auth" }, { status: 500 });
    }

    // Verifica se já existe um Client para esse usuário ou agente
    const existing = await db.client.findFirst({
        where: { OR: [{ stackUserId }, { zaiaAgentId }] },
    });
    if (existing) {
        return NextResponse.json(
            { error: "Já existe um cliente com esse usuário ou agente Zaia." },
            { status: 409 }
        );
    }

    const client = await db.client.create({
        data: {
            stackUserId,
            companyName,
            zaiaAgentId,
            zaiaApiKey,
            plan: plan ?? "basic",
        },
    });

    return NextResponse.json({ client }, { status: 201 });
}
