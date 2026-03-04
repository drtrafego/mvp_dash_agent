"use client";

import { useUser } from "@stackframe/stack";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/inbox", label: "Inbox", icon: "💬" },
  { href: "/dashboard/leads", label: "Leads", icon: "👥" },
  { href: "/dashboard/settings", label: "Configurações", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useUser();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const clientId = searchParams.get("clientId");

  useEffect(() => {
    const checkAdmin = async () => {
      const res = await fetch("/api/admin/verify");
      if (res.ok) setIsSuperAdmin(true);
    };
    checkAdmin();
  }, []);

  const handleSignOut = async () => {
    await user?.signOut();
    router.push("/login");
  };

  const wrapHref = (href: string) => {
    if (!clientId) return href;
    const url = new URL(href, window.location.origin);
    url.searchParams.set("clientId", clientId);
    return `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ""}`;
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-base font-bold tracking-tight">Agent Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1 truncate">
          {user?.displayName ?? user?.primaryEmail}
        </p>
        {clientId && (
          <div className="mt-2 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-500 font-bold uppercase tracking-wider">
            Visualizando Cliente
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={wrapHref(item.href)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${isActive
                ? "bg-blue-600 text-white font-medium"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {isSuperAdmin && (
          <div className="pt-4 mt-4 border-t border-gray-700 space-y-1">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-violet-400 hover:bg-gray-800 hover:text-violet-300"
            >
              <span className="text-base">🤖</span>
              <span>{clientId ? "Voltar ao Painel Admin" : "Painel Admin"}</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm"
        >
          <span className="text-base">🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
