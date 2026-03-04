import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";

export async function getAuthenticatedClient() {
  const user = await stackServerApp.getUser();
  if (!user) return { user: null, client: null };

  const client = await db.client.findUnique({
    where: { stackUserId: user.id },
  });

  return { user, client };
}
