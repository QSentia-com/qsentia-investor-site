import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { adminAuthMode } from '@/lib/adminAuth';
import { buildAdminOverview } from '@/lib/adminOverview';
import AdminConsole from './AdminConsole';

export const metadata: Metadata = {
  title: 'QSentia Admin Console',
  description: 'Back-office controls for model commerce, CRM, careers, and internal tickets.',
};

export default async function AdminPage() {
  let initialData = null;

  if (adminAuthMode() === 'development') {
    const headerStore = await headers();
    const host = headerStore.get('host') || 'localhost:3001';
    const protocol = headerStore.get('x-forwarded-proto') || 'http';
    initialData = await buildAdminOverview(new Request(`${protocol}://${host}/admin`));
  }

  return <AdminConsole initialData={initialData} />;
}
