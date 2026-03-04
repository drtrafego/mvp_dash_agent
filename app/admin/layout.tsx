import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const isAuthed = await isAdminAuthenticated();

    // Permite sempre acesso à página /admin (login). Para o resto, exige auth.
    // A verificação real de cada sub-rota é feita via redirect dentro do layout do dashboard.
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {children}
        </div>
    );
}
