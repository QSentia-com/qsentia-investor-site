import { NextResponse, type NextRequest } from 'next/server';
import { getRequestUser } from '@/lib/adminAuth';
import { readCommerceOverview } from '@/lib/adminApiCommerce';

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const commerce = await readCommerceOverview();
  const email = user.email.toLowerCase();
  const customer = commerce.customers.find((record) => record.email.toLowerCase() === email) || null;
  const entitlements = customer
    ? commerce.entitlements.filter((record) => record.customerId === customer.id && record.status === 'active')
    : [];
  const requestsUsed = entitlements.reduce((sum, record) => sum + record.requestsUsed, 0);
  const requestLimit = entitlements.reduce((sum, record) => sum + record.requestLimit, 0);
  const metadata = user.user_metadata || {};
  const organization = customer?.organization
    || (typeof metadata.organization === 'string' ? metadata.organization : null);

  return NextResponse.json(
    {
      account: {
        id: customer?.id || null,
        billingStatus: customer?.billingStatus || 'Not configured',
        billingEmail: user.email,
        billingEntity: organization,
        taxStatus: null,
      },
      subscription: {
        plan: customer?.plan || null,
        status: customer?.status || 'Not configured',
        interval: customer?.billingCycle || null,
        currency: customer?.currency || 'USD',
        monthlyAmount: customer?.monthlyRevenue ?? null,
        trialEndsAt: customer?.status === 'trial' ? customer.renewalAt : null,
        nextInvoiceAt: customer?.status === 'active' ? customer.renewalAt : null,
        activeSeats: customer?.seats || 0,
        includedModels: entitlements.length,
        modelIds: entitlements.map((record) => record.modelId),
      },
      paymentMethod: {
        status: null,
        brand: null,
        last4: null,
        autopay: false,
      },
      usage: requestLimit > 0
        ? [{ label: 'API requests', used: requestsUsed, limit: requestLimit }]
        : [],
      invoices: [],
      checklist: [
        { label: 'Commercial account', status: customer ? 'Complete' : 'Not configured' },
        { label: 'Billing terms', status: customer?.billingStatus === 'current' ? 'Complete' : 'Not configured' },
        { label: 'Model entitlement', status: entitlements.length ? 'Complete' : 'Not configured' },
      ],
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
