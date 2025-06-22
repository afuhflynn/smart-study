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
    subject: "🔐 New Login to Your ChapterFlux Account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ChapterFlux Login Notification</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 40px 32px; text-align: center; }
            .logo { display: inline-flex; align-items: center; gap: 12px; color: white; font-size: 24px; font-weight: bold; text-decoration: none; }
            .logo-icon { width: 32px; height: 32px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
            .content { padding: 40px 32px; }
            .title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 16px; }
            .subtitle { color: #6b7280; margin-bottom: 32px; line-height: 1.6; }
            .info-card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0; }
            .info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: 600; color: #374151; }
            .info-value { color: #6b7280; }
            .alert-box { background: #fef3cd; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .alert-text { color: #92400e; font-size: 14px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
            .footer { background: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer-text { color: #6b7280; font-size: 14px; }
            .footer-links { margin-top: 16px; }
            .footer-link { color: #3b82f6; text-decoration: none; margin: 0 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <div class="logo-icon">📖</div>
                ChapterFlux
              </div>
            </div>
            
            <div class="content">
              <h1 class="title">New Login Detected</h1>
              <p class="subtitle">
                Hi ${data.userName},<br><br>
                We detected a new login to your ChapterFlux account. Here are the details:
              </p>
              
              <div class="info-card">
                <div class="info-row">
                  <span class="info-label">🕒 Time</span>
                  <span class="info-value">${data.timestamp}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🌐 Browser</span>
                  <span class="info-value">${data.browser}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">💻 Operating System</span>
                  <span class="info-value">${data.os}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📱 Device</span>
                  <span class="info-value">${data.device}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📍 IP Address</span>
                  <span class="info-value">${data.ip}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🗺️ Location</span>
                  <span class="info-value">${data.location}</span>
                </div>
              </div>
              
              <div class="alert-box">
                <p class="alert-text">
                  <strong>⚠️ If this wasn't you:</strong> Please secure your account immediately by changing your password and reviewing your account settings.
                </p>
              </div>
              
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" class="button">
                  Review Account Settings
                </a>
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                If you have any concerns about your account security, please contact our support team immediately.
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                This email was sent from ChapterFlux. You're receiving this because you have an account with us.
              </p>
              <div class="footer-links">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="footer-link">Dashboard</a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" class="footer-link">Settings</a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" class="footer-link">Support</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      ChapterFlux - New Login Detected
      
      Hi ${data.userName},
      
      We detected a new login to your ChapterFlux account:
      
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
    subject: "📥 Your ChapterFlux Data Export is Ready",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ChapterFlux Data Export</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 32px; text-align: center; }
            .logo { display: inline-flex; align-items: center; gap: 12px; color: white; font-size: 24px; font-weight: bold; text-decoration: none; }
            .logo-icon { width: 32px; height: 32px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
            .content { padding: 40px 32px; }
            .title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 16px; }
            .subtitle { color: #6b7280; margin-bottom: 32px; line-height: 1.6; }
            .download-card { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0ea5e9; border-radius: 12px; padding: 32px; text-align: center; margin: 24px 0; }
            .download-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 16px 0; }
            .info-box { background: #fef3cd; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .info-text { color: #92400e; font-size: 14px; }
            .footer { background: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer-text { color: #6b7280; font-size: 14px; }
            .features-list { list-style: none; padding: 0; margin: 24px 0; }
            .features-list li { padding: 8px 0; color: #374151; }
            .features-list li:before { content: "✅ "; margin-right: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <div class="logo-icon">📖</div>
                ChapterFlux
              </div>
            </div>
            
            <div class="content">
              <h1 class="title">Your Data Export is Ready! 🎉</h1>
              <p class="subtitle">
                Hi ${data.userName},<br><br>
                We've successfully compiled all your ChapterFlux data into a comprehensive PDF report. 
                Your export includes:
              </p>
              
              <ul class="features-list">
                <li>Account information and profile details</li>
                <li>Complete reading history and progress</li>
                <li>All uploaded documents and content</li>
                <li>Quiz results and performance analytics</li>
                <li>Reading preferences and settings</li>
                <li>Usage statistics and insights</li>
              </ul>
              
              <div class="download-card">
                <h3 style="margin-top: 0; color: #0c4a6e;">🚀 Download Your Data</h3>
                <p style="color: #0369a1; margin-bottom: 24px;">
                  Your personalized data export is ready for download. Click the button below to get your PDF report.
                </p>
                <a href="${data.downloadUrl}" class="download-button">
                  📥 Download My Data (PDF)
                </a>
              </div>
              
              <div class="info-box">
                <p class="info-text">
                  <strong>⏰ Important:</strong> This download link will expire on ${data.expiresAt}. 
                  Please download your data before this date.
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                The PDF contains all your data in an organized, easy-to-read format. If you have any questions 
                about your data export, please don't hesitate to contact our support team.
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                This email was sent from ChapterFlux in response to your data export request.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      ChapterFlux - Your Data Export is Ready!
      
      Hi ${data.userName},
      
      Your ChapterFlux data export is ready for download. The PDF includes:
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
      from: `"ChapterFlux" <${process.env.SMTP_USER}>`,
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
export const sendLoginNotification = async (user: User, deviceInfo: any) => {
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
