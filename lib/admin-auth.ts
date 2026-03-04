import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Verifica se a requisição tem a sessão de admin válida.
 * Retorna null se autorizado, ou um Response de erro se não.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (!session || session !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return null;
}

/**
 * Verifica cookie para uso em Server Components (pages).
 */
export async function isAdminAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    return session === process.env.ADMIN_PASSWORD;
}
