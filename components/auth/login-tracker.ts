"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

export function LoginTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    // Only send notification for authenticated users
    if (session?.user) {
      const sendLoginNotification = async () => {
        try {
          const response = await fetch("/api/auth/login-notification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Login notification sent:", data.emailSent);
          }
        } catch (error) {
          console.error("Failed to send login notification:", error);
        }
      };

      // Only send notification once per session
      const notificationSent = sessionStorage.getItem("loginNotificationSent");
      if (!notificationSent) {
        sendLoginNotification();
        sessionStorage.setItem("loginNotificationSent", "true");
      }
    }
  }, [session]);

  return null; // This component doesn't render anything
}
