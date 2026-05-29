import { NextResponse } from 'next/server';
import { getLiveMarketplaceModels } from '@/lib/modelCatalog';

export async function GET(request: Request) {
  try {
    const models = await getLiveMarketplaceModels(request);

    return NextResponse.json(
      {
        models,
        source: 'live-dashboard',
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
