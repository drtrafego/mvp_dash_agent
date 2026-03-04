import { db } from "@/lib/db";

export async function getUserClient(userId: string, userEmail?: string | null) {
    if (!userEmail) {
        return await db.client.findFirst({
            where: { stackUserId: userId },
        });
    }

    // Find the client by ID or Email
    const client = await db.client.findFirst({
        where: {
            OR: [
                { stackUserId: userId },
                { email: userEmail },
            ],
        },
    });

    if (!client) {
        return null;
    }

    // If the client exists but doesn't have the stackUserId set yet (pre-registered by email)
    // we bind it now.
    if (!client.stackUserId || client.stackUserId !== userId) {
        return await db.client.update({
            where: { id: client.id },
            data: { stackUserId: userId },
        });
    }

    return client;
}
