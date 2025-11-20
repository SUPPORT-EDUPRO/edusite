import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy | EduSitePro',
  description: 'Information about cookies used on EduSitePro website.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Link href="/" className="mb-8 inline-block text-amber-600 hover:text-amber-700">
          ← Back to Home
        </Link>

        <h1 className="mb-8 text-4xl font-bold text-stone-900">Cookie Policy</h1>

        <div className="prose prose-stone max-w-none">
          <p className="text-lg text-gray-600">
            <strong>Last Updated:</strong> October 13, 2025
          </p>

          <p>
            This Cookie Policy explains how EduSitePro uses cookies and similar technologies on our
            website.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit our website. They help
            us provide you with a better experience.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">Cookies We Use</h2>

          <h3 className="mt-6 text-xl font-semibold text-gray-900">1. Essential Cookies</h3>
          <p>Required for the website to function properly. Cannot be disabled.</p>
          <ul>
            <li>Session management</li>
            <li>Security and authentication</li>
            <li>Form submission</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-900">2. Analytics Cookies</h3>
          <p>Help us understand how visitors use our website. Optional - requires consent.</p>
          <ul>
            <li>PostHog analytics</li>
            <li>Vercel Analytics</li>
            <li>Page view tracking</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-900">3. Marketing Cookies</h3>
          <p>Track conversions and campaign effectiveness. Optional - requires consent.</p>
          <ul>
            <li>UTM parameter tracking</li>
            <li>Conversion tracking</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">Managing Cookies</h2>
          <p>You can control cookies through:</p>
          <ul>
            <li>Our cookie consent banner</li>
            <li>Your browser settings</li>
            <li>Third-party opt-out tools</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">Third-Party Cookies</h2>
          <p>We use services from:</p>
          <ul>
            <li>
              <strong>PostHog:</strong> Analytics and user behavior tracking
            </li>
            <li>
              <strong>Vercel:</strong> Performance monitoring
            </li>
            <li>
              <strong>hCaptcha:</strong> Form spam protection
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">Your Rights</h2>
          <p>Under POPIA, you have the right to:</p>
          <ul>
            <li>Withdraw cookie consent at any time</li>
            <li>Delete cookies from your browser</li>
            <li>Request information about cookies we use</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">Contact</h2>
          <p>
            Questions about cookies?{' '}
            <a href="mailto:privacy@edusitepro.co.za" className="text-amber-600">
              privacy@edusitepro.co.za
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
