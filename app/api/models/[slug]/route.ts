import { NextResponse } from 'next/server';
import { getLiveModelDetails } from '@/lib/modelCatalog';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const model = await getLiveModelDetails(request, slug);

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        model,
        source: 'live-dashboard',
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 });
  }
}
