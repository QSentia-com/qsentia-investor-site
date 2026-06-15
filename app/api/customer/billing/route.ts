import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

async function sessionUser(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function customerProfile(user: User | null) {
  const metadata = user?.user_metadata || {};
  const name =
    typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : user?.email?.split('@')[0] || 'Customer';
  const organization =
    typeof metadata.organization === 'string' && metadata.organization.trim()
      ? metadata.organization.trim()
      : 'QSentia customer workspace';

  return {
    name,
    email: user?.email || 'Authenticated account',
    organization,
  };
}

export async function GET(request: NextRequest) {
  const profile = customerProfile(await sessionUser(request));

  return NextResponse.json(
    {
      account: {
        id: `cus_${profile.email.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        billingStatus: 'Trial',
        billingEmail: profile.email,
        billingEntity: profile.organization,
        taxStatus: 'Not configured',
      },
      subscription: {
        plan: 'Model Access Pilot',
        status: 'Trial',
        interval: 'Monthly',
        currency: 'USD',
        monthlyAmount: 0,
        trialEndsAt: '2026-07-13T00:00:00.000Z',
        nextInvoiceAt: null,
        activeSeats: 1,
        includedModels: 2,
      },
      paymentMethod: {
        status: 'Required before live trading',
        brand: null,
        last4: null,
        autopay: false,
      },
      usage: [
        { label: 'Model seats', used: 1, limit: 3 },
        { label: 'Model trials', used: 1, limit: 2 },
        { label: 'Broker connections', used: 0, limit: 2 },
        { label: 'Scheduled runs', used: 0, limit: 250 },
      ],
      invoices: [
        {
          id: 'INV-TEST-001',
          period: 'Pilot setup',
          issuedAt: '2026-06-13T00:00:00.000Z',
          dueAt: '2026-07-13T00:00:00.000Z',
          amount: 0,
          status: 'Open',
        },
      ],
      checklist: [
        { label: 'Billing profile', status: 'Pending' },
        { label: 'Payment method', status: 'Required' },
        { label: 'Model agreement', status: 'Draft' },
        { label: 'Broker authorization', status: 'Not connected' },
        { label: 'Risk disclosure', status: 'Pending' },
      ],
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
