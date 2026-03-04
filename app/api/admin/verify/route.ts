import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
    const isAdmin = await isAdminAuthenticated();

    if (isAdmin) {
        return NextResponse.json({ admin: true });
    }

    return NextResponse.json({ error: "Access Denied" }, { status: 403 });
}
