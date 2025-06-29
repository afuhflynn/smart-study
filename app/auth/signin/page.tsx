"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { Logo } from "@/components/layout/logo";
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
     const {error} =  await signIn.social({
        provider,
        callbackURL: "/auth/signin",
      });

      // const response = await fetch("/api/auth/login-notification", {
      //   method: "POST",
      // });

      // const data = await response.json();

      if (!error) {
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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex-1 items-center justify-center p-4 min-h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="w-full flex items-center justify-center mb-6">
          <Logo />
        </div>
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Continue with one of the oauth providers below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSignIn("google")}
              disabled={isLoading === "github" || isLoading === "google"}
            >
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              {isLoading === "google" ? "Signin in..." : "Google"}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSignIn("github")}
              disabled={isLoading === "github" || isLoading === "google"}
              className="w-full"
            >
              {isLoading === "github" ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Github className="w-5 h-5 mr-2" />
              )}
              {isLoading === "github" ? "Signin in..." : "Github"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service{" "}
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy{" "}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
