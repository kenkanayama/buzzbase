import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Design system colors
const COLORS = {
  primary: '#f29801',
  neutral50: '#fafafa',
  neutral200: '#e5e5e5',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral800: '#262626',
  neutral900: '#171717',
};

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.neutral50 }}>
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-b border-gray-200/50">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4">
          <Link
            to="/"
            className="flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div
          className="rounded-2xl bg-white p-8 shadow-sm"
          style={{ border: `1px solid ${COLORS.neutral200}` }}
        >
          {/* Introduction */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold" style={{ color: COLORS.neutral900 }}>
              Privacy Policy
            </h2>
            <p className="leading-relaxed" style={{ color: COLORS.neutral600 }}>
              This Privacy Policy describes how BuzzBase (the "Service", "we", "us", or "our")
              collects, uses, and protects your personal information when you use our influencer
              support web application that automatically tracks and visualizes view counts for PR
              posts.
            </p>
            <p className="mt-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              By using BuzzBase, you agree to the collection and use of information in accordance
              with this policy.
            </p>
          </div>

          {/* 1. Information We Collect */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: COLORS.neutral900 }}>
              1. Information We Collect
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              We collect information necessary to provide our Service. The types of personal
              information we collect include:
            </p>
            <ul className="ml-6 list-disc space-y-2" style={{ color: COLORS.neutral600 }}>
              <li>
                <strong>Account Information:</strong> Email address, password (encrypted), display
                name
              </li>
              <li>
                <strong>SNS Account Information:</strong> Instagram account ID, username, profile
                picture URL, and access tokens (obtained through OAuth authentication)
              </li>
              <li>
                <strong>PR Post Data:</strong> Post URLs, campaign/product names, post timestamps,
                media IDs, thumbnail URLs, and Instagram insights data (views, reach, saves, likes,
                comments, watch time)
              </li>
              <li>
                <strong>Profile Information:</strong> Contact information (phone number), address
                (postal code, prefecture, city, street address, building name), and bank account
                information (bank name, branch name, account number, account holder name)
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you access and use the Service,
                including device information, IP address, browser type, and access times
              </li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: COLORS.neutral900 }}>
              2. How We Use Your Information
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              We use the collected information for the following purposes:
            </p>
            <ul className="ml-6 list-disc space-y-2" style={{ color: COLORS.neutral600 }}>
              <li>
                <strong>Service Provision:</strong> To provide, maintain, and improve our Service,
                including automatic view count tracking and data visualization
              </li>
              <li>
                <strong>Account Management:</strong> To create and manage your account, authenticate
                your identity, and process your requests
              </li>
              <li>
                <strong>SNS Integration:</strong> To connect your Instagram account and fetch your
                posts and insights data through Instagram API
              </li>
              <li>
                <strong>Data Processing:</strong> To automatically fetch view counts and insights
                data 7 days after post publication using scheduled batch processing
              </li>
              <li>
                <strong>Communication:</strong> To send you service-related notifications, respond
                to your inquiries, and provide customer support
              </li>
              <li>
                <strong>Payment Processing:</strong> To process payments and manage bank account
                information for compensation purposes
              </li>
              <li>
                <strong>Analytics:</strong> To analyze usage patterns, improve our Service, and
                develop new features
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and
                legal processes
              </li>
            </ul>
          </section>

          {/* 3. Third-Party Services */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: COLORS.neutral900 }}>
              3. Third-Party Services
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              Our Service integrates with the following third-party services:
            </p>
            <ul className="ml-6 list-disc space-y-2" style={{ color: COLORS.neutral600 }}>
              <li>
                <strong>Firebase Authentication:</strong> For user authentication and account
                management. Firebase's privacy policy applies to authentication data.
              </li>
              <li>
                <strong>Instagram API:</strong> To access your Instagram account data and insights.
                Your use of Instagram API is also subject to Meta's Privacy Policy.
              </li>
              <li>
                <strong>Google Cloud Platform (GCP):</strong> For hosting, data storage, and
                processing. Data is stored in Cloud Firestore and processed using Cloud Functions.
              </li>
            </ul>
            <p className="mt-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              We do not sell your personal information to third parties. We may share your
              information only in the following circumstances:
            </p>
            <ul className="ml-6 list-disc space-y-2" style={{ color: COLORS.neutral600 }}>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or respond to lawful requests</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </section>

          {/* 4. Data Security */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: COLORS.neutral900 }}>
              4. Data Security
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              We implement appropriate technical and organizational security measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. These measures include:
            </p>
            <ul className="ml-6 list-disc space-y-2" style={{ color: COLORS.neutral600 }}>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security assessments and updates</li>
              <li>Secure cloud infrastructure provided by Google Cloud Platform</li>
              <li>Limited access to personal information on a need-to-know basis</li>
            </ul>
            <p className="mt-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              However, no method of transmission over the Internet or electronic storage is 100%
              secure. While we strive to use commercially acceptable means to protect your personal
              information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* 5. Data Retention */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: COLORS.neutral900 }}>
              5. Data Retention
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              We retain your personal information for as long as necessary to provide our Service and
              fulfill the purposes outlined in this Privacy Policy, unless a longer retention period
              is required or permitted by law. When you delete your account, we will delete or
              anonymize your personal information, except where we are required to retain it for
              legal or regulatory purposes.
            </p>
          </section>

          {/* 6. Your Rights */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: COLORS.neutral900 }}>
              6. Your Rights
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              You have the following rights regarding your personal information:
            </p>
            <ul className="ml-6 list-disc space-y-2" style={{ color: COLORS.neutral600 }}>
              <li>
                <strong>Access:</strong> You can request access to the personal information we hold
                about you
              </li>
              <li>
                <strong>Correction:</strong> You can request correction of inaccurate or incomplete
                information
              </li>
              <li>
                <strong>Deletion:</strong> You can request deletion of your personal information
                (subject to legal requirements)
              </li>
              <li>
                <strong>Portability:</strong> You can request a copy of your data in a
                machine-readable format
              </li>
              <li>
                <strong>Withdrawal of Consent:</strong> You can withdraw your consent for data
                processing at any time
              </li>
              <li>
                <strong>Account Deletion:</strong> You can delete your account at any time through
                the Service settings
              </li>
            </ul>
            <p className="mt-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              To exercise these rights, please contact us using the contact information provided
              below. We will respond to your request within a reasonable timeframe.
            </p>
          </section>

          {/* 7. International Data Transfers */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: COLORS.neutral900 }}>
              7. International Data Transfers
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              Your information may be transferred to and processed in countries other than your
              country of residence. These countries may have data protection laws that differ from
              those in your country. We ensure that appropriate safeguards are in place to protect
              your personal information in accordance with this Privacy Policy, including:
            </p>
            <ul className="ml-6 list-disc space-y-2" style={{ color: COLORS.neutral600 }}>
              <li>
                Using cloud infrastructure providers (Google Cloud Platform) that comply with
                international data protection standards
              </li>
              <li>Implementing standard contractual clauses where required</li>
              <li>Ensuring compliance with applicable data protection regulations</li>
            </ul>
          </section>

          {/* 8. Children's Privacy */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: COLORS.neutral900 }}>
              8. Children's Privacy
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              Our Service is not intended for children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you are a parent or guardian
              and believe that your child has provided us with personal information, please contact
              us immediately. If we become aware that we have collected personal information from a
              child under 13, we will take steps to delete such information.
            </p>
          </section>

          {/* 9. Changes to This Privacy Policy */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: COLORS.neutral900 }}>
              9. Changes to This Privacy Policy
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last Updated"
              date. You are advised to review this Privacy Policy periodically for any changes.
              Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
            <p className="mt-4 text-sm" style={{ color: COLORS.neutral500 }}>
              Last Updated: January 2025
            </p>
          </section>

          {/* 10. Contact Us */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: COLORS.neutral900 }}>
              10. Contact Us
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: COLORS.neutral600 }}>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please contact us:
            </p>
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: COLORS.neutral50, border: `1px solid ${COLORS.neutral200}` }}
            >
              <p className="font-semibold" style={{ color: COLORS.neutral900 }}>
                BuzzBase Privacy Policy Inquiry
              </p>
              <p className="mt-2" style={{ color: COLORS.neutral600 }}>
                Please contact us through the support form available in the Service or via email at
                the contact address provided in the Service.
              </p>
            </div>
          </section>

          {/* Back to Home */}
          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
              style={{
                backgroundColor: COLORS.primary,
                color: 'white',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e38500')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

