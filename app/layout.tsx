import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { LoginTracker } from "@/components/auth/login-tracker";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "SmartStudy - AI-Powered Reading Platform",
  description:
    "Transform your reading experience with AI-powered summaries, quizzes, and personalized recommendations",
  keywords: "reading, AI, summaries, quizzes, text-to-speech, education",
  authors: [{ name: "SmartStudy Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <div className="min-h-screen bg-background">
              {children}
              <LoginTracker />
            </div>
            <Toaster
              position="top-right"
              theme="system"
              expand={true}
              richColors
              closeButton
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
