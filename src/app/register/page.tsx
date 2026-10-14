import { headers } from 'next/headers';

import { YoungEaglesLiveRegistrationForm } from '@/components/registration/YoungEaglesLiveRegistrationForm';
import { YOUNG_EAGLES_ORGANIZATION_ID } from '@/lib/young-eagles-registration';

export const dynamic = 'force-dynamic';

function MessageCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{children}</p>
      </div>
    </div>
  );
}

/**
 * Tenant registration entry point. The school comes from the domain (middleware sets
 * x-tenant-id), never from the browser. Young Eagles uses the 2027 application, which
 * saves through the server route. Other schools have no online intake yet: the old generic
 * form wrote columns the live database does not have and could never save.
 */
export default async function RegistrationPage() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  let tenantId = headersList.get('x-tenant-id');
  if (!tenantId && (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1'))) {
    tenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID?.trim() || tenantId;
  }

  if (!tenantId) {
    return (
      <MessageCard title="School not identified">
        Unable to identify the school. Please open this page from your school&apos;s website.
      </MessageCard>
    );
  }

  if (tenantId === YOUNG_EAGLES_ORGANIZATION_ID) {
    return <YoungEaglesLiveRegistrationForm />;
  }

  return (
    <MessageCard title="Online registration is not available yet">
      This school has not opened online registration. Please contact the school directly to register
      your child.
    </MessageCard>
  );
}
