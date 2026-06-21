import type { Metadata } from 'next';
import AdminConsole from './AdminConsole';

export const metadata: Metadata = {
  title: 'QSentia Admin Console',
  description: 'Back-office controls for model commerce, CRM, careers, and internal tickets.',
};

export default function AdminPage() {
  return <AdminConsole />;
}
