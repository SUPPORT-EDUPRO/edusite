'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import ThemeCustomizer from '@/components/admin/ThemeCustomizer';

export default function ThemesPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Theme Customization</h1>
          <p className="mt-2 text-stone-600">
            Customize your site&apos;s appearance with colors, fonts, and layout options.
          </p>
        </div>

        <ThemeCustomizer />
      </div>
    </AdminLayout>
  );
}
