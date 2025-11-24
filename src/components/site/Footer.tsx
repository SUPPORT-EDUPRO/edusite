import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-stone-100">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-stone-700 to-stone-800 text-white">
                <span className="text-xl font-bold">E</span>
              </div>
              <span className="text-lg font-bold text-stone-900">
                Edu<span className="text-amber-600">Site</span>Pro
              </span>
            </Link>
            <p className="mt-4 text-sm text-stone-600">
              Professional NCF-aligned websites for South African ECD centres.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-stone-900">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/templates"
                  className="text-sm text-stone-600 transition-colors hover:text-amber-600"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-stone-600 transition-colors hover:text-amber-600"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/bulk"
                  className="text-sm text-stone-600 transition-colors hover:text-amber-600"
                >
                  Bulk Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-stone-900">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.education.gov.za/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-stone-600 transition-colors hover:text-amber-600"
                >
                  Dept. of Education
                </a>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="text-sm text-stone-600 transition-colors hover:text-amber-600"
                >
                  NCF Framework
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-stone-900">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-stone-600 transition-colors hover:text-amber-600"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-stone-600 transition-colors hover:text-amber-600"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookie-policy"
                  className="text-sm text-stone-600 transition-colors hover:text-amber-600"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Partners Section */}
        <div className="mt-12 border-t border-stone-200 pt-8">
          <h3 className="mb-6 text-center text-sm font-semibold tracking-wide text-stone-700 uppercase">
            Our Partners
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <a
              href="https://www.hasc.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hope Academic and Skill Centre"
              className="group cursor-pointer rounded-xl border border-stone-200 bg-white p-2 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              title="Hope Academic and Skill Centre"
            >
              <div className="flex h-28 w-44 items-center justify-center rounded-xl bg-white p-6 shadow-lg ring-1 ring-stone-200 transition-all group-hover:scale-[1.02] group-hover:shadow-xl group-hover:ring-stone-300">
                <img
                  src="/partners/hasc-logo.png"
                  alt="HASC Logo"
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            </a>
            <a
              href="https://soilofafrica.org/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Soil of Africa"
              className="group cursor-pointer rounded-xl border border-stone-200 bg-white p-2 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              title="Soil of Africa"
            >
              <div className="flex h-28 w-44 items-center justify-center rounded-xl bg-white p-6 shadow-lg ring-1 ring-stone-200 transition-all group-hover:scale-[1.02] group-hover:shadow-xl group-hover:ring-stone-300">
                <img
                  src="/partners/soa-logo.png"
                  alt="Soil of Africa Logo"
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-stone-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-stone-600">
              © {currentYear} EduSitePro. Empowering South African ECD centres.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="mailto:support@edusitepro.co.za"
                className="text-sm text-stone-600 transition-colors hover:text-amber-600"
              >
                Contact Us
              </a>
              <span className="text-stone-300">|</span>
              <a
                href="https://edusitepro.edudashpro.org.za/admin"
                className="text-sm text-stone-600 transition-colors hover:text-amber-600"
              >
                Admin
              </a>
              <span className="text-stone-300">|</span>
              <p className="text-sm text-stone-600">🇿🇦 Proudly South African</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
