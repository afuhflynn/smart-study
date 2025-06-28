"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="h-screen bg-background flex items-center justify-between overflow-hidden">
      <Sidebar />
      <main className="max-w-8xl flex-1 mx-auto py-6">{children}</main>
    </div>
  );
}
