import { stackServerApp } from "@/stack";
import { redirect } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { getUserClient } from "@/lib/db-helper";
import { Suspense } from "react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/login");

  // Attempt to load and optionally bind the client's stackUserId if newly signed up
  const client = await getUserClient(user.id, user.primaryEmail);
  if (!client) {
    // If the agency hasn't created this client account yet, maybe show a pending screen
    // For now we just let them in, but pages will show "No data"
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={<div className="w-64 bg-gray-900 border-r border-gray-800" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
