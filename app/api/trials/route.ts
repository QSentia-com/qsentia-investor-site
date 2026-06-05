import { NextResponse } from 'next/server';
import { redeemOfferCode, upsertLead } from '@/lib/adminBackOffice';

function offerSummary(offer: Awaited<ReturnType<typeof redeemOfferCode>>) {
  if (!offer) return null;
  return {
    code: offer.code,
    title: offer.title,
    trialDays: offer.trialDays,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    expiresAt: offer.expiresAt,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const organization = typeof body.organization === 'string' ? body.organization.trim() : '';
    const modelId = typeof body.modelId === 'string' ? body.modelId.trim() : '';
    const modelName = typeof body.modelName === 'string' ? body.modelName.trim() : '';
    const code = typeof body.discountCode === 'string' ? body.discountCode.trim() : '';

    if (!name || !email || !modelId) {
      return NextResponse.json(
        { error: 'Name, email, and model are required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const offer = code ? await redeemOfferCode(code, modelId) : null;

    if (code && !offer) {
      return NextResponse.json(
        { error: 'Discount code is not active for this model' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    await upsertLead({
      name,
      email,
      organization,
      source: 'contact',
      interest: `Free trial request${modelName ? `: ${modelName}` : ''}`,
      modelId,
      notes: offer
        ? `Trial request submitted with code ${offer.code}. ${offer.title}.`
        : 'Trial request submitted without a discount code.',
      stage: 'new',
    });

    return NextResponse.json(
      { ok: true, offer: offerSummary(offer) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error submitting trial request:', error);
    return NextResponse.json(
      { error: 'Failed to submit trial request' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
