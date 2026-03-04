import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
        redirect("/admin");
    }

    return <>{children}</>;
}
