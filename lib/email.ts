import nodemailer from "nodemailer";
import { User } from "@prisma/client";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Email templates
export const emailTemplates = {
  loginNotification: (data: {
    userName: string;
    device: string;
    browser: string;
    os: string;
    ip: string;
    location: string;
    timestamp: string;
  }) => ({
    subject: "🔐 New Login to Your SmartStudy Account",
    html: `
      <!DOCTYPE html>
<html lang="en" class="antialiased">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SmartStudy Login Notification</title>
    <style type="text/tailwindcss">
      @tailwind base;
      @tailwind components;
      @tailwind utilities;

      @layer base {
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          /* … all your other variables … */
          --radius: 0.5rem;
        }

        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          /* … */
        }

        * {
          @apply border-border font-sans;
        }

        body {
          @apply bg-background text-foreground;
        }
      }

      /* animations, hover, glass, scrollbar… paste your entire custom CSS here */
      @keyframes float { /* … */ }
      @keyframes gradient-shift { /* … */ }
      @keyframes shimmer { /* … */ }
      @keyframes bounce-in { /* … */ }
      @keyframes slide-up { /* … */ }
      @keyframes fade-in-scale { /* … */ }

      .animate-float { animation: float 3s ease-in-out infinite; }
      .animate-gradient {
        background-size: 200% 200%;
        animation: gradient-shift 3s ease infinite;
      }
      .animate-shimmer { /* … */ }
      .animate-bounce-in { /* … */ }
      .animate-slide-up { /* … */ }
      .animate-fade-in-scale { /* … */ }

      .hover-lift:hover { /* … */ }
      .hover-glow:hover { /* … */ }

      .text-gradient { /* … */ }
      .glass { /* … */ }
      .glass-dark { /* … */ }

      ::-webkit-scrollbar { /* … */ }
      ::-webkit-scrollbar-track { /* … */ }
      ::-webkit-scrollbar-thumb { /* … */ }
      ::-webkit-scrollbar-thumb:hover { /* … */ }
    </style>
  </head>

  <body class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-lg mx-auto bg-card rounded-[var(--radius)] shadow-md overflow-hidden">
      <!-- Header -->
      <header class="bg-gradient-to-br from-primary to-secondary px-8 py-12 text-center animate-gradient">
        <a href="#" class="inline-flex items-center gap-3 text-primary-foreground text-2xl font-bold animate-bounce-in">
          <div class="w-8 h-8 bg-card-foreground rounded-md flex items-center justify-center">
            📖
          </div>
          SmartStudy
        </a>
      </header>

      <!-- Content -->
      <main class="p-8 space-y-6">
        <h1 class="text-2xl font-semibold text-foreground animate-slide-up">New Login Detected</h1>
        <p class="text-muted-foreground leading-relaxed animate-fade-in-scale">
          Hi ${data.userName},<br />
          We detected a new login to your SmartStudy account. Here are the details:
        </p>

        <!-- Info Card -->
        <div class="bg-muted border input rounded-[var(--radius)] p-6 space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-2">
            <span class="font-semibold text-foreground">🕒 Time</span>
            <span class="text-muted-foreground">${data.timestamp}</span>
          </div>
          <div class="flex justify-between items-center border-b border-border pb-2">
            <span class="font-semibold text-foreground">🌐 Browser</span>
            <span class="text-muted-foreground">${data.browser}</span>
          </div>
          <div class="flex justify-between items-center border-b border-border pb-2">
            <span class="font-semibold text-foreground">💻 OS</span>
            <span class="text-muted-foreground">${data.os}</span>
          </div>
          <div class="flex justify-between items-center border-b border-border pb-2">
            <span class="font-semibold text-foreground">📱 Device</span>
            <span class="text-muted-foreground">${data.device}</span>
          </div>
          <div class="flex justify-between items-center border-b border-border pb-2">
            <span class="font-semibold text-foreground">📍 IP Address</span>
            <span class="text-muted-foreground">${data.ip}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-foreground">🗺️ Location</span>
            <span class="text-muted-foreground">${data.location}</span>
          </div>
        </div>

        <!-- Alert -->
        <div class="bg-yellow-50 border-yellow-300 rounded-[var(--radius)] p-4 glass-dark animate-shimmer">
          <p class="text-yellow-800 text-sm">
            <strong>⚠️ If this wasn't you:</strong>
            Please secure your account immediately by changing your password and reviewing your account settings.
          </p>
        </div>

        <!-- CTA -->
        <div class="text-center">
          <a
            href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings"
            class="inline-block px-6 py-3 rounded-[var(--radius)] font-semibold bg-primary text-primary-foreground hover-lift hover-glow animate-bounce-in"
          >
            Review Account Settings
          </a>
        </div>

        <p class="text-muted-foreground text-sm text-center mt-6">
          If you have any concerns about your account security, please contact our support team immediately.
        </p>
      </main>

      <!-- Footer -->
      <footer class="bg-muted p-6 border-t border-border text-center">
        <p class="text-muted-foreground text-sm">This email was sent from SmartStudy. You're receiving this because you have an account with us.</p>
        <div class="mt-4 space-x-4">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="text-primary hover:underline">Dashboard</a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" class="text-primary hover:underline">Settings</a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" class="text-primary hover:underline">Support</a>
        </div>
      </footer>
    </div>
  </body>
</html>

    `,
    text: `
      SmartStudy - New Login Detected
      
      Hi ${data.userName},
      
      We detected a new login to your SmartStudy account:
      
      Time: ${data.timestamp}
      Browser: ${data.browser}
      OS: ${data.os}
      Device: ${data.device}
      IP: ${data.ip}
      Location: ${data.location}
      
      If this wasn't you, please secure your account immediately.
      
      Visit: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings
    `,
  }),

  dataExportReady: (data: {
    userName: string;
    downloadUrl: string;
    expiresAt: string;
  }) => ({
    subject: "📥 Your SmartStudy Data Export is Ready",
    html: `
      <!DOCTYPE html>
<html lang="en" class="antialiased">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SmartStudy Data Export</title>
    <style type="text/tailwindcss">
      @tailwind base;
      @tailwind components;
      @tailwind utilities;

      @layer base {
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --primary: 158.2 76.8% 46.9%;      /* #10b981 */
          --primary-foreground: 0 0% 100%;
          --secondary: 159.3 77.5% 35.9%;    /* #059669 */
          --secondary-foreground: 0 0% 100%;
          --muted: 210 40% 96%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --border: 214.3 31.8% 91.4%;
          --radius: 0.5rem;
        }
        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
        }
        * { @apply border-border font-sans; }
        body { @apply bg-background text-foreground; }
      }

      /* copy-paste your custom animations, hover & glass CSS here */
    </style>
  </head>

  <body class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-lg mx-auto bg-card rounded-[var(--radius)] shadow-md overflow-hidden">
      <!-- Header -->
      <header class="bg-gradient-to-br from-primary to-secondary px-8 py-12 text-center animate-gradient">
        <a href="#" class="inline-flex items-center gap-3 text-primary-foreground text-2xl font-bold animate-bounce-in">
          <div class="w-8 h-8 bg-card-foreground rounded-md flex items-center justify-center">
            📖
          </div>
          SmartStudy
        </a>
      </header>

      <!-- Content -->
      <main class="p-8 space-y-6">
        <h1 class="text-2xl font-semibold text-foreground animate-slide-up">
          Your Data Export is Ready! 🎉
        </h1>

        <p class="text-muted-foreground leading-relaxed animate-fade-in-scale">
          Hi ${data.userName},<br />
          We've successfully compiled all your SmartStudy data into a comprehensive PDF report. Your export includes:
        </p>

        <!-- Features List -->
        <ul class="space-y-2 list-none ml-4 marker:text-primary animate-float">
          <li class="flex items-start">
            <span class="mr-2">✅</span>
            <span>Account information and profile details</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">✅</span>
            <span>Complete reading history and progress</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">✅</span>
            <span>All uploaded documents and content</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">✅</span>
            <span>Quiz results and performance analytics</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">✅</span>
            <span>Reading preferences and settings</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">✅</span>
            <span>Usage statistics and insights</span>
          </li>
        </ul>

        <!-- Download Card -->
        <div class="bg-gradient-to-br from-muted to-card border-secondary border rounded-[var(--radius)] p-6 text-center animate-shimmer">
          <h3 class="text-lg font-semibold text-foreground mb-2 animate-bounce-in">🚀 Download Your Data</h3>
          <p class="text-primary mb-6 animate-slide-up">
            Your personalized data export is ready for download. Click below to get your PDF.
          </p>
          <a
            href="${data.downloadUrl}"
            class="inline-block px-6 py-3 rounded-[var(--radius)] font-semibold bg-primary text-primary-foreground hover-lift hover-glow animate-fade-in-scale"
          >
            📥 Download My Data (PDF)
          </a>
        </div>

        <!-- Info Box -->
        <div class="bg-yellow-50 border-yellow-300 rounded-[var(--radius)] p-4 glass-dark animate-shimmer">
          <p class="text-yellow-800 text-sm">
            <strong>⏰ Important:</strong>
            This link expires on ${data.expiresAt}. Please download before then.
          </p>
        </div>

        <p class="text-muted-foreground text-sm text-center mt-6 animate-fade-in-scale">
          The PDF contains all your data in an organized, easy-to-read format. Questions? Hit up our support team.
        </p>
      </main>

      <!-- Footer -->
      <footer class="bg-muted p-6 border-t border-border text-center">
        <p class="text-muted-foreground text-sm">
          Sent by SmartStudy in response to your data export request.
        </p>
      </footer>
    </div>
  </body>
</html>

    `,
    text: `
      SmartStudy - Your Data Export is Ready!
      
      Hi ${data.userName},
      
      Your SmartStudy data export is ready for download. The PDF includes:
      - Account information and profile
      - Reading history and progress
      - All uploaded documents
      - Quiz results and analytics
      - Reading preferences
      - Usage statistics
      
      Download Link: ${data.downloadUrl}
      Expires: ${data.expiresAt}
      
      Please download your data before the expiration date.
    `,
  }),
};

// Create transporter
const createTransporter = () => {
  const emailConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(emailConfig);
};

// Send email function
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Email credentials not configured, skipping email send");
      return false;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Flynn | SmartStudy" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};

// Send login notification
export const sendLoginNotification = async (
  user: User,
  deviceInfo: {
    device: string;
    browser: string;
    os: string;
    ip: string;
    location: string;
  }
) => {
  const template = emailTemplates.loginNotification({
    userName: user.name || "User",
    device: deviceInfo.device || "Unknown Device",
    browser: deviceInfo.browser || "Unknown Browser",
    os: deviceInfo.os || "Unknown OS",
    ip: deviceInfo.ip || "Unknown IP",
    location: deviceInfo.location || "Unknown Location",
    timestamp: new Date().toLocaleString(),
  });

  return sendEmail({
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

// Send data export notification
export const sendDataExportNotification = async (
  user: User,
  downloadUrl: string,
  expiresAt: Date
) => {
  const template = emailTemplates.dataExportReady({
    userName: user.name || "User",
    downloadUrl,
    expiresAt: expiresAt.toLocaleDateString(),
  });

  return sendEmail({
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};
