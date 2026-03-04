import { db } from "./db";
import { isSuperAdmin } from "./admin-auth";

/**
 * Helper para buscar o cliente associado ao usuário logado.
 * 
 * @param userId ID do usuário no Stack Auth
 * @param userEmail Email do usuário no Stack Auth (opcional)
 * @param impersonatedClientId ID do cliente a ser "impersonado" (apenas superadmins)
 */
export async function getUserClient(userId: string, userEmail?: string | null, impersonatedClientId?: string | null) {
    // Se houver ID de impersonação, verificamos se o usuário é superadmin primeiro
    if (impersonatedClientId) {
        const isAdmin = await isSuperAdmin(userEmail);
        if (isAdmin) {
            return await db.client.findUnique({
                where: { id: impersonatedClientId }
            });
        }
    }

    // Busca normal por stackUserId (para o cliente logado ou admin vendo seu próprio dashboard se cadastrado)
    let client = await db.client.findUnique({
        where: { stackUserId: userId },
    });

    if (!client && userEmail) {
        client = await db.client.findUnique({
            where: { email: userEmail },
        });

        if (client) {
            client = await db.client.update({
                where: { id: client.id },
                data: { stackUserId: userId },
            });
        }
    }

    return client;
}
