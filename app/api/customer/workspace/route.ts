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
        workspaceId: `QS-${profile.email.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24)}`,
        stage: 'Setup review',
        environment: 'Paper trading',
        onboardingOwner: 'Investor relations',
      },
      billingAddress: {
        company: profile.organization,
        contact: profile.name,
        line1: 'Billing address pending',
        line2: '',
        city: 'Not configured',
        region: '',
        postalCode: '',
        country: 'United States',
      },
      broker: {
        status: 'Not connected',
        provider: 'Alpaca or IBKR',
        accountMode: 'Paper first',
        credentialsVault: 'Required',
      },
      apiAccess: {
        keyStatus: 'Not issued',
        keyScope: 'Read + paper trade',
        webhookStatus: 'Not configured',
        environment: 'Sandbox',
        lastRotation: null,
      },
      automation: {
        status: 'Draft',
        scheduler: 'QSentia managed worker',
        workerRuntime: 'Server CRON',
        cronExpression: '30 14 * * 1-5',
        cadence: 'Market days',
        timezone: 'UTC',
        nextRunAt: null,
        approvalPolicy: 'Manual approval before live',
      },
      risk: {
        capitalLimit: 'Required',
        maxDailyLoss: 'Required',
        orderType: 'Market or limit',
        approvalMode: 'Manual review',
      },
      readiness: [
        { label: 'Billing address', status: 'Pending', owner: 'Customer' },
        { label: 'Payment method', status: 'Required', owner: 'Customer' },
        { label: 'Broker credentials', status: 'Required', owner: 'Customer' },
        { label: 'API key', status: 'Not issued', owner: 'QSentia' },
        { label: 'Webhook endpoint', status: 'Pending', owner: 'Customer' },
        { label: 'Risk limits', status: 'Pending', owner: 'Customer + QSentia' },
        { label: 'Paper validation', status: 'Not started', owner: 'QSentia' },
      ],
      activity: [
        {
          title: 'Customer workspace created',
          body: `${profile.email} was granted access to the setup console.`,
          timestamp: '2026-06-13T00:00:00.000Z',
        },
        {
          title: 'Commercial setup opened',
          body: 'Billing profile and payment method are awaiting completion.',
          timestamp: '2026-06-13T00:05:00.000Z',
        },
        {
          title: 'Automation parked',
          body: 'Scheduler remains draft until broker and risk approval are complete.',
          timestamp: '2026-06-13T00:10:00.000Z',
        },
      ],
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
