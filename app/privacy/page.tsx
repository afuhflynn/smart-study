import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Shield, Eye, Lock, UserCheck, Database, Globe } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-3">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your privacy is important to us. Learn how we collect, use, and
              protect your information.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Last updated: January 2024
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <Eye className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Information We Collect
                </h2>
              </div>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Personal Information
              </h3>
              <ul className="mb-6">
                <li>Name and email address when you create an account</li>
                <li>Profile information you choose to provide</li>
                <li>Reading preferences and settings</li>
                <li>Documents you upload to our service</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Usage Information
              </h3>
              <ul className="mb-6">
                <li>Reading activity and progress</li>
                <li>Quiz performance and scores</li>
                <li>Device information and browser type</li>
                <li>IP address and general location</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Content Information
              </h3>
              <ul>
                <li>Text extracted from uploaded documents</li>
                <li>AI-generated summaries and quiz questions</li>
                <li>Audio narration preferences</li>
                <li>Bookmarks and reading annotations</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <Database className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  How We Use Your Information
                </h2>
              </div>

              <ul className="mb-6">
                <li>
                  <strong>Service Delivery:</strong> Process your documents,
                  generate summaries, create quizzes, and provide audio
                  narration
                </li>
                <li>
                  <strong>Personalization:</strong> Customize your reading
                  experience and provide relevant recommendations
                </li>
                <li>
                  <strong>Communication:</strong> Send important updates,
                  notifications, and support messages
                </li>
                <li>
                  <strong>Analytics:</strong> Improve our service through
                  aggregated usage analysis
                </li>
                <li>
                  <strong>Security:</strong> Protect against fraud, abuse, and
                  security threats
                </li>
                <li>
                  <strong>Legal Compliance:</strong> Meet our legal obligations
                  and enforce our terms
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Information Sharing
                </h2>
              </div>

              <p className="mb-4">
                We do not sell your personal information. We may share
                information in these situations:
              </p>

              <ul className="mb-6">
                <li>
                  <strong>Service Providers:</strong> Third-party services that
                  help us operate (AI processing, cloud storage, analytics)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law,
                  court order, or government request
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with
                  mergers, acquisitions, or asset sales
                </li>
                <li>
                  <strong>Consent:</strong> When you explicitly agree to share
                  information
                </li>
                <li>
                  <strong>Protection:</strong> To protect rights, property, or
                  safety of ChapterFlux, users, or others
                </li>
              </ul>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Third-Party Services
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  We use Google Gemini for AI processing and ElevenLabs for
                  text-to-speech. These services may process your content
                  according to their own privacy policies.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <Lock className="h-6 w-6 text-red-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Data Security
                </h2>
              </div>

              <p className="mb-4">
                We implement robust security measures to protect your
                information:
              </p>

              <ul className="mb-6">
                <li>
                  <strong>Encryption:</strong> Data is encrypted in transit and
                  at rest
                </li>
                <li>
                  <strong>Access Controls:</strong> Strict access controls and
                  authentication
                </li>
                <li>
                  <strong>Regular Audits:</strong> Security assessments and
                  vulnerability testing
                </li>
                <li>
                  <strong>Data Minimization:</strong> We collect only necessary
                  information
                </li>
                <li>
                  <strong>Secure Infrastructure:</strong> Industry-standard
                  cloud security
                </li>
              </ul>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                  Important Note
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  While we implement strong security measures, no system is 100%
                  secure. Please use strong passwords and keep your account
                  information confidential.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <UserCheck className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Your Rights
                </h2>
              </div>

              <p className="mb-4">
                You have the following rights regarding your personal
                information:
              </p>

              <ul className="mb-6">
                <li>
                  <strong>Access:</strong> Request a copy of your personal
                  information
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct inaccurate
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Portability:</strong> Export your data in a portable
                  format
                </li>
                <li>
                  <strong>Restriction:</strong> Limit how we process your
                  information
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain types of
                  processing
                </li>
                <li>
                  <strong>Withdrawal:</strong> Withdraw consent for processing
                </li>
              </ul>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                To exercise these rights, please contact us at{" "}
                <a
                  href="mailto:privacy@chapterflux.com"
                  className="text-blue-600 hover:underline"
                >
                  privacy@chapterflux.com
                </a>
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Data Retention
              </h2>

              <p className="mb-4">
                We retain your information for as long as necessary to provide
                our services:
              </p>

              <ul className="mb-6">
                <li>
                  <strong>Account Information:</strong> Until you delete your
                  account
                </li>
                <li>
                  <strong>Documents:</strong> Until you delete them or close
                  your account
                </li>
                <li>
                  <strong>Usage Data:</strong> Aggregated data may be retained
                  indefinitely
                </li>
                <li>
                  <strong>Legal Obligations:</strong> As required by applicable
                  law
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Cookies and Tracking
              </h2>

              <p className="mb-4">
                We use cookies and similar technologies to:
              </p>

              <ul className="mb-6">
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure security and prevent fraud</li>
              </ul>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can control cookies through your browser settings, but some
                features may not work properly if cookies are disabled.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Children's Privacy
              </h2>

              <p className="mb-4">
                ChapterFlux is not intended for children under 13. We do not
                knowingly collect personal information from children under 13.
                If we become aware that we have collected personal information
                from a child under 13, we will take steps to delete such
                information.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                International Data Transfers
              </h2>

              <p className="mb-4">
                Your information may be processed in countries other than your
                country of residence. We ensure appropriate safeguards are in
                place to protect your information during international
                transfers.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Changes to This Policy
              </h2>

              <p className="mb-4">
                We may update this privacy policy from time to time. We will
                notify you of any material changes by email or through our
                service. Your continued use of ChapterFlux after changes become
                effective constitutes acceptance of the new policy.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Contact Us
              </h2>

              <p className="mb-4">
                If you have any questions about this privacy policy or our
                privacy practices, please contact us:
              </p>

              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>
                  <strong>Email:</strong> privacy@chapterflux.com
                </p>
                <p>
                  <strong>Address:</strong> ChapterFlux Inc., 123 AI Street, San
                  Francisco, CA 94105
                </p>
                <p>
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
