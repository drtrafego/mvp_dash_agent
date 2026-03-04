import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from "next/server";

export async function isSuperAdmin(email?: string | null): Promise<boolean> {
    if (!email) return false;
    const superAdmins = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    return superAdmins.includes(email.toLowerCase());
}

/**
 * Verifica se a requisição tem a sessão de admin válida (Stack Auth).
 * Retorna null se autorizado, ou um Response de erro se não.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
    const user = await stackServerApp.getUser();
    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const isAdmin = await isSuperAdmin(user.primaryEmail);
    if (!isAdmin) {
        return NextResponse.json({ error: "Acesso negado: apenas administradores" }, { status: 403 });
    }

    return null;
}

/**
 * Verifica admin para uso em Server Components (layouts/pages).
 */
export async function isAdminAuthenticated(): Promise<boolean> {
    const user = await stackServerApp.getUser();
    if (!user) return false;
    return await isSuperAdmin(user.primaryEmail);
}
