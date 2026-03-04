import { stackServerApp } from "@/stack";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    return (stackServerApp as any).handler.GET(req);
}

export async function POST(req: Request) {
    return (stackServerApp as any).handler.POST(req);
}
