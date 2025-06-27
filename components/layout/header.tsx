"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, User, Settings, LogOut, Book } from "lucide-react";
import { motion } from "framer-motion";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ui/theme-toggle";
import { Logo } from "./logo";

export function Header() {
  const { data: session, isPending } = useSession();
  const pathName = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            window.location.href = "/";
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      // Fallback redirect
      window.location.href = "/";
    }
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl w-full md:px-12 px-6"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container py-4 flex items-center justify-between relative">
        <Logo />

        <div className="flex items-center space-x-4 absolute right-0">
          {isPending ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ) : (
            session?.user && (
              <>
                {pathName === "/dashboard" && <ThemeToggle />}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8 border-2 border-slate-200 dark:border-slate-700">
                          <AvatarImage
                            src={session?.user?.image || ""}
                            alt={session?.user?.name || ""}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                            {session?.user?.name?.charAt(0) ||
                              session?.user?.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs leading-none text-slate-600 dark:text-slate-400">
                          {session?.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Link href="/dashboard/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )
          )}
        </div>
        <div className="flex items-center space-x-4">
          {!session && (
            <Link href="/auth/signin">
              <Button className="bg-primary hover:opacity-90">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
