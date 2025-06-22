import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  FileText,
  Scale,
  Users,
  AlertTriangle,
  Shield,
  CreditCard,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-3">
                <Scale className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Please read these terms carefully before using ChapterFlux.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Last updated: January 2024
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Agreement to Terms
                </h2>
              </div>

              <p className="mb-4">
                By accessing and using ChapterFlux ("Service"), you accept and
                agree to be bound by the terms and provision of this agreement.
              </p>

              <p className="mb-4">
                If you do not agree to abide by the above, please do not use
                this service. These terms apply to all visitors, users, and
                others who access or use the service.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Important Note
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  These terms constitute a legally binding agreement between you
                  and ChapterFlux Inc. Please read them carefully.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Use License
                </h2>
              </div>

              <p className="mb-4">
                Permission is granted to temporarily use ChapterFlux for
                personal, non-commercial transitory viewing only. This is the
                grant of a license, not a transfer of title, and under this
                license you may not:
              </p>

              <ul className="mb-6">
                <li>modify or copy the materials</li>
                <li>
                  use the materials for any commercial purpose or for any public
                  display
                </li>
                <li>
                  attempt to reverse engineer any software contained on the
                  service
                </li>
                <li>
                  remove any copyright or other proprietary notations from the
                  materials
                </li>
                <li>violate any applicable laws or regulations</li>
              </ul>

              <p className="mb-4">
                This license shall automatically terminate if you violate any of
                these restrictions and may be terminated by ChapterFlux at any
                time.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  User Accounts
                </h2>
              </div>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Account Creation
              </h3>
              <ul className="mb-6">
                <li>
                  You must provide accurate and complete registration
                  information
                </li>
                <li>
                  You are responsible for maintaining the security of your
                  account
                </li>
                <li>You must be at least 13 years old to create an account</li>
                <li>
                  One person or legal entity may maintain no more than one
                  account
                </li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Account Responsibilities
              </h3>
              <ul className="mb-6">
                <li>
                  You are responsible for all content posted and activity under
                  your account
                </li>
                <li>
                  You must notify us immediately of any unauthorized use of your
                  account
                </li>
                <li>You may not share your account credentials with others</li>
                <li>You must keep your contact information up to date</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Content and Conduct
                </h2>
              </div>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Uploaded Content
              </h3>
              <ul className="mb-6">
                <li>
                  You retain ownership of content you upload to the service
                </li>
                <li>
                  You grant us license to process your content to provide the
                  service
                </li>
                <li>
                  You are responsible for ensuring you have rights to upload
                  content
                </li>
                <li>
                  You must not upload content that violates copyright or other
                  laws
                </li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Prohibited Uses
              </h3>
              <ul className="mb-6">
                <li>Uploading malicious, illegal, or harmful content</li>
                <li>Attempting to gain unauthorized access to the service</li>
                <li>Using the service to spam or harass others</li>
                <li>Violating any applicable laws or regulations</li>
                <li>Interfering with the proper functioning of the service</li>
              </ul>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                  Content Removal
                </h4>
                <p className="text-sm text-red-700 dark:text-red-400">
                  We reserve the right to remove content that violates these
                  terms or is otherwise objectionable, at our sole discretion.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Subscription and Billing
                </h2>
              </div>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Free and Paid Plans
              </h3>
              <ul className="mb-6">
                <li>
                  ChapterFlux offers both free and paid subscription plans
                </li>
                <li>
                  Free plans have usage limitations and feature restrictions
                </li>
                <li>
                  Paid plans provide additional features and higher usage limits
                </li>
                <li>Pricing and features are subject to change with notice</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Payment Terms
              </h3>
              <ul className="mb-6">
                <li>
                  Subscriptions are billed in advance on a monthly or annual
                  basis
                </li>
                <li>Payment is due immediately upon subscription</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>You may cancel your subscription at any time</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Cancellation and Refunds
              </h3>
              <ul className="mb-6">
                <li>
                  You may cancel your subscription at any time from your account
                  settings
                </li>
                <li>
                  Cancellation takes effect at the end of the current billing
                  period
                </li>
                <li>
                  We offer prorated refunds for unused portions of annual
                  subscriptions
                </li>
                <li>Free trial cancellations do not result in charges</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Disclaimers and Limitations
                </h2>
              </div>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Service Availability
              </h3>
              <ul className="mb-6">
                <li>The service is provided "as is" without warranties</li>
                <li>We do not guarantee continuous, uninterrupted access</li>
                <li>Features may be modified or discontinued at any time</li>
                <li>Third-party services may affect service availability</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                AI-Generated Content
              </h3>
              <ul className="mb-6">
                <li>AI-generated summaries and quizzes may contain errors</li>
                <li>Users should verify important information independently</li>
                <li>We are not responsible for accuracy of AI outputs</li>
                <li>AI models may have biases or limitations</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Limitation of Liability
              </h3>
              <p className="mb-4">
                In no event shall ChapterFlux or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the service.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Intellectual Property
              </h2>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Our Rights
              </h3>
              <ul className="mb-6">
                <li>
                  ChapterFlux and its content are protected by copyright and
                  trademark laws
                </li>
                <li>
                  The service name, logo, and design are trademarks of
                  ChapterFlux Inc.
                </li>
                <li>
                  You may not use our trademarks without written permission
                </li>
                <li>All rights not expressly granted are reserved</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Your Rights
              </h3>
              <ul className="mb-6">
                <li>You retain ownership of content you upload</li>
                <li>You may download and delete your content at any time</li>
                <li>We do not claim ownership of your uploaded documents</li>
                <li>
                  AI-generated content based on your uploads remains associated
                  with your account
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Privacy and Data Protection
              </h2>

              <p className="mb-4">
                Your privacy is important to us. Our collection and use of
                personal information is governed by our Privacy Policy, which is
                incorporated into these terms by reference.
              </p>

              <ul className="mb-6">
                <li>We collect information necessary to provide the service</li>
                <li>We use industry-standard security measures</li>
                <li>We do not sell your personal information</li>
                <li>You may request deletion of your data</li>
              </ul>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please review our{" "}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>{" "}
                for detailed information about our data practices.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Termination
              </h2>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Termination by You
              </h3>
              <ul className="mb-6">
                <li>You may terminate your account at any time</li>
                <li>Termination can be initiated from your account settings</li>
                <li>
                  Your data will be deleted according to our data retention
                  policy
                </li>
                <li>
                  Paid subscriptions remain active until the end of the billing
                  period
                </li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Termination by Us
              </h3>
              <ul className="mb-6">
                <li>We may terminate accounts that violate these terms</li>
                <li>We may suspend service for non-payment</li>
                <li>
                  We may terminate service with notice for business reasons
                </li>
                <li>Violation of terms may result in immediate termination</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Governing Law
              </h2>

              <p className="mb-4">
                These terms shall be governed by and construed in accordance
                with the laws of the State of California, without regard to its
                conflict of law provisions.
              </p>

              <p className="mb-4">
                Any disputes arising from these terms or your use of the service
                shall be subject to the exclusive jurisdiction of the courts of
                California.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Changes to Terms
              </h2>

              <p className="mb-4">
                We reserve the right to modify or replace these terms at any
                time. If a revision is material, we will try to provide at least
                30 days notice prior to any new terms taking effect.
              </p>

              <p className="mb-4">
                By continuing to access or use our service after those revisions
                become effective, you agree to be bound by the revised terms.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h2>

              <p className="mb-4">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>

              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>
                  <strong>Email:</strong> legal@chapterflux.com
                </p>
                <p>
                  <strong>Address:</strong> ChapterFlux Inc., 123 AI Street, San
                  Francisco, CA 94105
                </p>
                <p>
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>

              <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Last Updated:</strong> January 15, 2024
                  <br />
                  <strong>Effective Date:</strong> January 15, 2024
                  <br />
                  <strong>Version:</strong> 1.2
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
