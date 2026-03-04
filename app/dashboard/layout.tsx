import { stackServerApp } from "@/stack";
import { redirect } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { getUserClient } from "@/lib/db-helper";
import { Suspense } from "react";
import { isSuperAdmin } from "@/lib/admin-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/login");

  // Verifica se é superadmin
  const isAdmin = await isSuperAdmin(user.primaryEmail);

  // Se for admin e NÃO houver um clientId na URL, manda para o painel de admin
  // Isso permite que o admin acesse o /dashboard?clientId=... para ver um cliente específico
  // Mas se ele clicar apenas em "Dashboard" ou acessar a home, vai para o painel da agência.
  // Nota: No Next.js App Router, para pegar searchParams no Layout, precisamos de uma alternativa
  // ou simplesmente não redirecionar se estivermos em uma rota que já tem o ID.

  // Como Layouts não recebem searchParams diretamente no Next.js (apenas Pages), 
  // vamos ajustar a lógica: o redirecionamento para /admin só acontece se ele estiver
  // na rota "nua" /dashboard sem intenção de ver um cliente.

  // Na verdade, a melhor forma de fazer isso é permitir que o admin entre no dashboard,
  // mas o 'getUserClient' dentro das páginas é que vai decidir qual dado mostrar 
  // baseado no que passamos na URL.

  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={<div className="w-64 bg-gray-900 border-r border-gray-800" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
