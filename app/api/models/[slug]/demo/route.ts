import { NextResponse } from 'next/server';
import {
  actionFromDecision,
  confidenceFromDecision,
  getLiveMarketplaceModels,
  getLiveSignalPreview,
  positionSizeFromDecision,
} from '@/lib/modelCatalog';

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + 3600000 });
    return true;
  }

  if (limit.count >= 5) {
    return false;
  }

  limit.count += 1;
  return true;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Preview calls are limited to 5 per hour.' },
        { status: 429 }
      );
    }

    const models = await getLiveMarketplaceModels(request);
    const selectedModel = models.find((model) => model.slug === slug);

    if (!selectedModel) {
      return NextResponse.json({ error: 'Model not found.' }, { status: 404 });
    }

    const startTime = Date.now();
    const payload = await getLiveSignalPreview(request, selectedModel.id);
    const decision = payload?.latest?.decision || null;
    const action = actionFromDecision(decision);
    const confidence = confidenceFromDecision(decision);
    const positionSize = positionSizeFromDecision(decision, payload);
    const latency = Date.now() - startTime;

    if (!action) {
      return NextResponse.json(
        {
          error: 'No live decision was available for this model at request time.',
          status: payload?.latest?.paperStatus || 'Pending',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      model: selectedModel.id,
      slug: selectedModel.slug,
      action,
      confidence,
      positionSize,
      latency,
      timestamp: new Date().toISOString(),
      source: 'latest_decision_log',
      note: 'Preview is sourced from the latest committed dashboard telemetry.',
    });
  } catch (error) {
    console.error('Signal preview error:', error);
    return NextResponse.json({ error: 'Preview failed. Please try again.' }, { status: 500 });
  }
}
