import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import CustomerDashboard from '@/components/CustomerDashboard';
import { PageShell, TechnicalBackdrop } from '@/components/PageChrome';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Customer Dashboard | QSentia',
  description: 'Protected customer workspace for model access, brokerage readiness, and trading controls.',
};

async function currentCustomer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const metadata = user.user_metadata || {};
  const nameValue = metadata.full_name || metadata.name;
  return {
    name: typeof nameValue === 'string' && nameValue.trim() ? nameValue.trim() : user.email.split('@')[0],
    email: user.email,
    organization: typeof metadata.organization === 'string' ? metadata.organization : '',
  };
}

export default async function CustomerPage() {
  const customer = await currentCustomer();
  if (!customer) redirect('/signin?next=/customer');

  return (
    <PageShell active="/customer">
      <section className="relative overflow-hidden border-b border-[#e2e7fb] bg-[#f8faff]">
        <TechnicalBackdrop />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <CustomerDashboard user={customer} />
        </div>
      </section>
    </PageShell>
  );
}
