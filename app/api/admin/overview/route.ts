import { NextResponse } from 'next/server';
import { unauthorizedAdminResponse } from '@/lib/adminAuth';
import { buildAdminOverview } from '@/lib/adminOverview';

export async function GET(request: Request) {
  const authError = unauthorizedAdminResponse(request);
  if (authError) return authError;

  try {
    return NextResponse.json(
      await buildAdminOverview(request),
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error loading admin overview:', error);
    return NextResponse.json(
      { error: 'Failed to load admin overview' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
