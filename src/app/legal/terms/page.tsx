import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | EduSitePro',
  description: 'Terms and conditions for using EduSitePro website services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Link href="/" className="mb-8 inline-block text-amber-600 hover:text-amber-700">
          ← Back to Home
        </Link>

        <h1 className="mb-8 text-4xl font-bold text-stone-900">Terms of Service</h1>

        <div className="prose prose-stone max-w-none">
          <p className="text-lg text-gray-600">
            <strong>Last Updated:</strong> October 13, 2025
          </p>

          <p>
            These Terms of Service govern your use of Edu SitePro&apos;s website and services. By
            accessing or using our services, you agree to be bound by these terms.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">1. Services</h2>
          <p>
            EduSitePro provides professional website creation services for South African Early
            Childhood Development (ECD) centres, including:
          </p>
          <ul>
            <li>NCF-aligned website templates</li>
            <li>Custom website design and development</li>
            <li>Hosting and maintenance services</li>
            <li>Domain registration assistance</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">2. Eligibility</h2>
          <p>
            You must be at least 18 years old and authorized to represent an ECD centre or
            educational organization to use our services.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">3. Pricing & Payment</h2>
          <p>All prices are in South African Rand (ZAR) and include:</p>
          <ul>
            <li>One-time setup fees as quoted</li>
            <li>Monthly hosting and maintenance fees</li>
            <li>Payments due within 7 days of invoice</li>
            <li>Late payments may result in service suspension</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">4. Intellectual Property</h2>
          <p>
            Website content you provide remains your property. EduSitePro retains ownership of
            templates, code, and design elements.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">5. Service Level</h2>
          <p>We commit to:</p>
          <ul>
            <li>99.5% uptime guarantee</li>
            <li>24-hour response time for support</li>
            <li>Monthly backup and security updates</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">6. Termination</h2>
          <p>
            Either party may terminate services with 30 days written notice. Early termination fees
            may apply.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
          <p>
            EduSitePro is not liable for indirect, incidental, or consequential damages arising from
            service use.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">8. Governing Law</h2>
          <p>
            These terms are governed by South African law. Disputes will be resolved in South
            African courts.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">9. Contact</h2>
          <p>
            For questions about these terms:{' '}
            <a href="mailto:legal@edusitepro.co.za" className="text-amber-600">
              legal@edusitepro.co.za
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
