import type { Metadata } from 'next';
import CustomerDashboard from '@/components/CustomerDashboard';
import { PageShell, TechnicalBackdrop } from '@/components/PageChrome';

export const metadata: Metadata = {
  title: 'Customer Dashboard | QSentia',
  description: 'Protected customer workspace for model access, brokerage readiness, and trading controls.',
};

export default function CustomerPage() {
  return (
    <PageShell active="/customer">
      <section className="relative overflow-hidden border-b border-[#e2e7fb] bg-[#f8faff]">
        <TechnicalBackdrop />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <CustomerDashboard
            user={{
              name: 'Customer',
              email: 'Authenticated account',
              organization: 'QSentia workspace',
            }}
          />
        </div>
      </section>
    </PageShell>
  );
}
