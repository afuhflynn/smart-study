"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Github } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import Link from "next/link";
import { signIn, useSession } from "@/lib/auth-client";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const handleSignIn = async (provider: "google" | "github") => {
    setIsLoading(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/auth/signin",
      });

      const response = await fetch("/api/auth/login-notification", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(null);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <motion.div
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-3 shadow-lg"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <BookOpen className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SmartStudy
            </span>
          </Link>
        </motion.div>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Sign in to your account to continue reading
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => handleSignIn("google")}
                disabled={isLoading === "google"}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
                size="lg"
              >
                {isLoading === "google" ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                ) : (
                  <FcGoogle className="w-5 h-5 mr-2" />
                )}
                Continue with Google
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => handleSignIn("github")}
                disabled={isLoading === "github"}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                size="lg"
              >
                {isLoading === "github" ? (
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Github className="w-5 h-5 mr-2" />
                )}
                Continue with GitHub
              </Button>
            </motion.div>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <Link
            href="/"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
          >
            ← Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
