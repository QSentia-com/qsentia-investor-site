import { NextResponse, type NextRequest } from 'next/server';
import { getRequestUser } from '@/lib/adminAuth';
import { readCommerceOverview } from '@/lib/adminApiCommerce';
import { readCustomerControls } from '@/lib/customerControls';

function userName(user: { email?: string; user_metadata?: Record<string, unknown> }) {
  const metadata = user.user_metadata || {};
  const name = metadata.full_name || metadata.name;
  return typeof name === 'string' && name.trim() ? name.trim() : user.email?.split('@')[0] || 'Customer';
}

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const commerce = await readCommerceOverview();
  const customer = commerce.customers.find((record) => record.email.toLowerCase() === user.email?.toLowerCase()) || null;
  const entitlements = customer
    ? commerce.entitlements.filter((record) => record.customerId === customer.id && record.status === 'active')
    : [];
  const keys = customer
    ? commerce.apiKeys.filter((record) => record.customerId === customer.id && record.status === 'active')
    : [];
  const relatedIds = new Set([
    ...(customer ? [customer.id] : []),
    ...entitlements.map((record) => record.id),
    ...keys.map((record) => record.id),
  ]);
  const environment = entitlements.some((record) => record.environment === 'live')
    ? 'Live'
    : entitlements.some((record) => record.environment === 'paper')
      ? 'Paper'
      : entitlements.some((record) => record.environment === 'sandbox')
        ? 'Sandbox'
        : 'Not configured';
  const metadata = user.user_metadata || {};
  const organization = customer?.organization
    || (typeof metadata.organization === 'string' ? metadata.organization : null);
  const scopes = Array.from(new Set(entitlements.map((record) => record.scope)));
  const controls = customer ? await readCustomerControls(customer.id) : null;

  return NextResponse.json(
    {
      account: {
        workspaceId: customer?.id || null,
        stage: customer?.status || 'Not configured',
        environment,
        onboardingOwner: customer?.salesOwner || null,
      },
      billingAddress: {
        company: organization,
        contact: userName(user),
        line1: null,
        line2: null,
        city: null,
        region: null,
        postalCode: null,
        country: null,
      },
      broker: {
        status: controls?.brokerStatus === 'onboarding_requested' ? 'Onboarding requested' : 'Not configured',
        provider: controls?.brokerProvider === 'none' ? null : controls?.brokerProvider || null,
        accountMode: controls?.executionMode || null,
        credentialsVault: controls?.brokerStatus === 'onboarding_requested' ? 'Server-side onboarding' : null,
      },
      apiAccess: {
        keyStatus: keys.length ? 'Active' : 'Not issued',
        keyScope: scopes.length ? scopes.join(', ') : null,
        webhookStatus: 'Not configured',
        environment,
        lastRotation: keys.reduce<string | null>((latest, key) => {
          if (!latest || new Date(key.createdAt) > new Date(latest)) return key.createdAt;
          return latest;
        }, null),
      },
      automation: {
        status: controls?.schedule !== 'manual' ? 'Configured' : 'Not configured',
        scheduler: controls?.schedule || null,
        workerRuntime: null,
        cronExpression: controls?.schedule === 'hourly' ? '0 * * * *' : controls?.schedule === 'daily' ? '0 13 * * *' : controls?.schedule === 'weekdays' ? '0 13 * * 1-5' : null,
        cadence: controls?.schedule || null,
        timezone: controls?.timezone || null,
        nextRunAt: null,
        approvalPolicy: controls?.approvalPolicy || null,
      },
      risk: {
        capitalLimit: controls?.maxNotional ? `$${controls.maxNotional.toLocaleString('en-US')}` : null,
        maxDailyLoss: controls?.maxDailyLossPct ? `${controls.maxDailyLossPct}%` : null,
        orderType: null,
        approvalMode: controls?.approvalPolicy || null,
      },
      readiness: [
        { label: 'Commercial account', status: customer ? 'Complete' : 'Not configured', owner: 'QSentia' },
        { label: 'Model entitlement', status: entitlements.length ? 'Complete' : 'Not configured', owner: 'QSentia' },
        { label: 'API credential', status: keys.length ? 'Complete' : 'Not issued', owner: 'QSentia' },
        { label: 'Broker connection', status: controls?.brokerStatus === 'onboarding_requested' ? 'Pending review' : 'Not configured', owner: 'Customer' },
        { label: 'Risk limits', status: controls && [controls.confidenceFloor,controls.maxDailyLossPct,controls.maxNotional,controls.maxContracts,controls.staleQuoteSeconds].every(value=>value!==null) ? 'Complete' : 'Not configured', owner: 'Customer and QSentia' },
      ],
      activity: commerce.auditEvents
        .filter((entry) => relatedIds.has(entry.entityId))
        .slice(0, 12)
        .map((entry) => ({ title: entry.action, body: entry.detail, timestamp: entry.createdAt })),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
