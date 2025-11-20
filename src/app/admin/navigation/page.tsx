'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import NavigationBuilder from '@/components/admin/NavigationBuilder';

export default function NavigationPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Navigation Menu</h1>
          <p className="mt-2 text-stone-600">
            Customize your site&apos;s navigation menu with links to pages, internal sections, and
            external sites.
          </p>
        </div>

        <NavigationBuilder />
      </div>
    </AdminLayout>
  );
}
