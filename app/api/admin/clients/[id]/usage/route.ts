import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { zaiaAPI } from "@/lib/zaia";

// GET /api/admin/clients/[id]/usage — retorna consumo do cliente na Zaia
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { id } = await params;
    const client = await db.client.findUnique({ where: { id }, select: { zaiaApiKey: true } });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
        const usage = await zaiaAPI.getUsage(client.zaiaApiKey);
        // Return only message counts — no credit balance or limits
        return NextResponse.json({
            generativeCount: usage?.usage?.generativeMessages?.count ?? null,
            externalCount: usage?.usage?.externalGenerativeMessages?.count ?? null,
        });
    } catch {
        return NextResponse.json({ generativeCount: null, externalCount: null });
    }
}
