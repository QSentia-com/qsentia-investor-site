import { NextResponse, type NextRequest } from 'next/server';
import { getRequestUser } from '@/lib/adminAuth';
import { readCommerceOverview } from '@/lib/adminApiCommerce';

const csv = (value: unknown) => `"${String(value ?? '').replaceAll('"','""')}"`;
export async function GET(request: NextRequest) {
  const user=await getRequestUser(request); if(!user?.email) return NextResponse.json({error:'Authentication required'},{status:401});
  const commerce=await readCommerceOverview(); const customer=commerce.customers.find(row=>row.email.toLowerCase()===user.email?.toLowerCase());
  if(!customer) return NextResponse.json({error:'Commercial customer account not linked'},{status:403});
  const entityIds=new Set([customer.id,...commerce.entitlements.filter(x=>x.customerId===customer.id).map(x=>x.id),...commerce.apiKeys.filter(x=>x.customerId===customer.id).map(x=>x.id)]);
  const rows=commerce.auditEvents.filter(x=>entityIds.has(x.entityId));
  const body=['timestamp,action,entity_type,entity_id,detail',...rows.map(row=>[row.createdAt,row.action,row.entityType,row.entityId,row.detail].map(csv).join(','))].join('\n');
  return new NextResponse(body,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="qsentia-audit-export.csv"','Cache-Control':'no-store'}});
}
