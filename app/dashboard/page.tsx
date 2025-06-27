"use client";

import { Dashboard } from "@/components/dashboard/dashboard";
import { Header } from "@/components/layout/header";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isPending && !session) {
  //     router.push("/auth/signin");
  //   }
  // }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // if (!session) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main>
        <Dashboard />
      </main>
    </div>
  );
}
