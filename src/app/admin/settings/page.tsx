import AdminLayout from '@/components/admin/AdminLayout';

export const metadata = {
  title: 'Settings | EduSitePro Admin',
};

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
          <p className="text-sm text-stone-600">Configure platform settings and integrations</p>
        </div>

        {/* Settings Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* General Settings */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <span>⚙️</span>
              General Settings
            </h3>
            <p className="text-sm text-stone-600">
              Platform name, logo, default timezone, and regional settings.
            </p>
            <div className="mt-4">
              <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50">
                Coming Soon
              </button>
            </div>
          </div>

          {/* Email Settings */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <span>📧</span>
              Email Settings
            </h3>
            <p className="text-sm text-stone-600">
              Configure SMTP, email templates, and notification preferences.
            </p>
            <div className="mt-4">
              <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50">
                Coming Soon
              </button>
            </div>
          </div>

          {/* Payment Integration */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <span>💳</span>
              Payment Integration
            </h3>
            <p className="text-sm text-stone-600">
              Connect Stripe, Paystack, or other payment providers for subscriptions.
            </p>
            <div className="mt-4">
              <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50">
                Coming Soon
              </button>
            </div>
          </div>

          {/* Analytics */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <span>📊</span>
              Analytics
            </h3>
            <p className="text-sm text-stone-600">
              PostHog, Google Analytics, and custom event tracking configuration.
            </p>
            <div className="mt-4">
              <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50">
                Coming Soon
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <span>🔒</span>
              Security
            </h3>
            <p className="text-sm text-stone-600">
              Authentication, 2FA, API keys, and access control settings.
            </p>
            <div className="mt-4">
              <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50">
                Coming Soon
              </button>
            </div>
          </div>

          {/* Integrations */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <span>🔌</span>
              Integrations
            </h3>
            <p className="text-sm text-stone-600">
              Connect to third-party services, webhooks, and API endpoints.
            </p>
            <div className="mt-4">
              <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-stone-900">System Information</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-stone-600">Platform Version</div>
              <div className="mt-1 font-medium text-stone-900">v0.1.0</div>
            </div>
            <div>
              <div className="text-sm text-stone-600">Database</div>
              <div className="mt-1 font-medium text-stone-900">Supabase PostgreSQL</div>
            </div>
            <div>
              <div className="text-sm text-stone-600">Hosting</div>
              <div className="mt-1 font-medium text-stone-900">Vercel Edge</div>
            </div>
            <div>
              <div className="text-sm text-stone-600">Framework</div>
              <div className="mt-1 font-medium text-stone-900">Next.js 14.2.5</div>
            </div>
            <div>
              <div className="text-sm text-stone-600">Region</div>
              <div className="mt-1 font-medium text-stone-900">South Africa (Cape Town)</div>
            </div>
            <div>
              <div className="text-sm text-stone-600">Environment</div>
              <div className="mt-1 font-medium text-stone-900">
                {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
