import { NextResponse, type NextRequest } from 'next/server';
import { getRequestUser } from '@/lib/adminAuth';
import { readCommerceOverview } from '@/lib/adminApiCommerce';
import { readCustomerControls, updateCustomerControls } from '@/lib/customerControls';

async function context(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user?.email) return null;
  const commerce = await readCommerceOverview();
  const customer = commerce.customers.find(row=>row.email.toLowerCase()===user.email?.toLowerCase());
  if (!customer) return { user, commerce, customer:null };
  return { user, commerce, customer };
}

export async function GET(request: NextRequest) {
  const ctx=await context(request); if(!ctx) return NextResponse.json({error:'Authentication required'},{status:401});
  if(!ctx.customer) return NextResponse.json({controls:null,reason:'Commercial customer account not linked'},{headers:{'Cache-Control':'no-store'}});
  return NextResponse.json({controls:await readCustomerControls(ctx.customer.id)},{headers:{'Cache-Control':'no-store'}});
}

export async function PATCH(request: NextRequest) {
  const ctx=await context(request); if(!ctx) return NextResponse.json({error:'Authentication required'},{status:401});
  if(!ctx.customer) return NextResponse.json({error:'Commercial customer account not linked'},{status:403});
  try {
    const liveEntitled=ctx.commerce.entitlements.some(row=>row.customerId===ctx.customer?.id && row.status==='active' && row.environment==='live');
    const controls=await updateCustomerControls(ctx.customer.id,await request.json(),liveEntitled);
    return NextResponse.json({controls},{headers:{'Cache-Control':'no-store'}});
  } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:'Unable to save controls'},{status:400}); }
}
