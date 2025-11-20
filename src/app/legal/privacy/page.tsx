import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | EduSitePro',
  description: 'POPIA-compliant privacy policy for EduSitePro website services.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Link href="/" className="mb-8 inline-block text-amber-600 hover:text-amber-700">
          ← Back to Home
        </Link>

        <h1 className="mb-8 text-4xl font-bold text-stone-900">Privacy Policy</h1>

        <div className="prose prose-stone max-w-none">
          <p className="text-lg text-gray-600">
            <strong>Last Updated:</strong> October 13, 2025
          </p>

          <p>
            EduSitePro (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
            protecting your privacy and complying with the Protection of Personal Information Act 4
            of 2013 (POPIA). This Privacy Policy explains how we collect, use, and safeguard your
            personal information.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">1. Information We Collect</h2>

          <h3 className="mt-6 text-xl font-semibold text-gray-900">1.1 Information You Provide</h3>
          <p>When you use our services or submit a quote request, we may collect:</p>
          <ul>
            <li>Contact information (name, email address, phone number)</li>
            <li>ECD centre information (name, location, number of centres)</li>
            <li>Preferences (languages, templates, provinces)</li>
            <li>Messages and communications with us</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            1.2 Automatically Collected Information
          </h3>
          <p>When you visit our website, we automatically collect:</p>
          <ul>
            <li>Device information (browser type, operating system)</li>
            <li>Usage data (pages visited, time spent, click patterns)</li>
            <li>IP address (anonymized)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>

          <p>We use your personal information to:</p>
          <ul>
            <li>Process and respond to your quote requests</li>
            <li>Provide our website creation services</li>
            <li>Send service-related communications</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
            <li>Prevent fraud and ensure security</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">3. Legal Basis (POPIA)</h2>

          <p>We process your personal information based on:</p>
          <ul>
            <li>
              <strong>Consent:</strong> You provide explicit consent when submitting forms
            </li>
            <li>
              <strong>Contract:</strong> Processing necessary to fulfill our services
            </li>
            <li>
              <strong>Legitimate Interest:</strong> Improving services and preventing fraud
            </li>
            <li>
              <strong>Legal Obligation:</strong> Compliance with South African law
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">4. Data Sharing</h2>

          <p>We may share your information with:</p>
          <ul>
            <li>
              <strong>Service Providers:</strong> Email services (Resend), analytics (PostHog),
              hosting (Vercel)
            </li>
            <li>
              <strong>Legal Authorities:</strong> When required by law or to protect our rights
            </li>
            <li>
              <strong>Business Transfers:</strong> In case of merger, acquisition, or sale
            </li>
          </ul>

          <p className="font-semibold">We never sell your personal information to third parties.</p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">5. Your POPIA Rights</h2>

          <p>Under POPIA, you have the right to:</p>
          <ul>
            <li>
              <strong>Access:</strong> Request a copy of your personal information
            </li>
            <li>
              <strong>Correction:</strong> Request corrections to inaccurate data
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your data
            </li>
            <li>
              <strong>Objection:</strong> Object to processing of your data
            </li>
            <li>
              <strong>Portability:</strong> Receive your data in a portable format
            </li>
            <li>
              <strong>Withdraw Consent:</strong> Withdraw consent at any time
            </li>
          </ul>

          <p>To exercise these rights, contact us at: privacy@edusitepro.co.za</p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">6. Data Security</h2>

          <p>We implement appropriate security measures including:</p>
          <ul>
            <li>SSL/TLS encryption for data transmission</li>
            <li>Secure hosting infrastructure</li>
            <li>Access controls and authentication</li>
            <li>Regular security audits</li>
            <li>Employee training on data protection</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">7. Data Retention</h2>

          <p>We retain your personal information for:</p>
          <ul>
            <li>
              <strong>Active leads:</strong> 2 years from last contact
            </li>
            <li>
              <strong>Customers:</strong> Duration of service + 5 years (legal requirement)
            </li>
            <li>
              <strong>Analytics data:</strong> 12 months
            </li>
            <li>
              <strong>Server logs:</strong> 7 days
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">8. Cookies</h2>

          <p>We use cookies for:</p>
          <ul>
            <li>
              <strong>Essential:</strong> Website functionality (always enabled)
            </li>
            <li>
              <strong>Analytics:</strong> Understanding usage patterns (optional)
            </li>
            <li>
              <strong>Marketing:</strong> Tracking conversions (optional)
            </li>
          </ul>

          <p>
            You can manage cookie preferences through our cookie banner or your browser settings.
            See our <Link href="/legal/cookie-policy">Cookie Policy</Link> for details.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">9. Children&apos;s Privacy</h2>

          <p>
            Our services are for ECD centres, not children. We do not knowingly collect personal
            information from children under 18. If we discover such data, we will delete it
            immediately.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">10. International Transfers</h2>

          <p>
            Your data may be transferred to and processed in countries outside South Africa,
            including the European Union and United States, where our service providers operate. We
            ensure adequate protection through:
          </p>
          <ul>
            <li>Standard contractual clauses</li>
            <li>Privacy Shield certification (where applicable)</li>
            <li>GDPR-compliant processors</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">11. Changes to This Policy</h2>

          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes by:
          </p>
          <ul>
            <li>Posting the new policy on this page</li>
            <li>Updating the &quot;Last Updated&quot; date</li>
            <li>Sending email notification for material changes</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">12. Contact Us</h2>

          <p>For privacy-related questions or to exercise your rights, contact:</p>

          <div className="rounded-lg bg-gray-50 p-6">
            <p className="mb-2">
              <strong>Information Officer:</strong> Privacy Team
            </p>
            <p className="mb-2">
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@edusitepro.co.za" className="text-amber-600">
                privacy@edusitepro.co.za
              </a>
            </p>
            <p className="mb-2">
              <strong>Physical Address:</strong> [Your Business Address]
            </p>
            <p>
              <strong>Response Time:</strong> We will respond within 30 days as required by POPIA
            </p>
          </div>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">13. Information Regulator</h2>

          <p>
            If you believe we have not handled your personal information properly, you may lodge a
            complaint with:
          </p>

          <div className="rounded-lg bg-gray-50 p-6">
            <p className="mb-2">
              <strong>Information Regulator (South Africa)</strong>
            </p>
            <p className="mb-2">Email: inforeg@justice.gov.za</p>
            <p>
              Website:{' '}
              <a
                href="https://www.justice.gov.za/inforeg/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600"
              >
                justice.gov.za/inforeg
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
