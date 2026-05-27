import { NextResponse } from 'next/server';

// Rate limiting would be implemented with Redis in production
// Simple in-memory store for demo (not production-ready)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
    return true;
  }

  if (limit.count >= 5) {
    return false; // Exceeded 5 calls per hour
  }

  limit.count++;
  return true;
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Demo calls limited to 5 per hour.' },
        { status: 429 }
      );
    }

    // Parse body or use defaults
    let ticker = 'AAPL';
    try {
      const body = await request.json();
      ticker = body.ticker || ticker;
    } catch (e) {
      // No body provided, use defaults
    }

    // Simulate ML worker processing time
    const startTime = Date.now();

    // Mock signal generation - in production this would call FastAPI ML worker
    const signals = ['BUY', 'SELL', 'HOLD'];
    const action = signals[Math.floor(Math.random() * signals.length)];
    const confidence = 0.6 + Math.random() * 0.35; // 0.6 to 0.95
    const positionSize = Math.min(confidence * 0.15, 0.1); // Max 10% position

    const latency = Date.now() - startTime + Math.floor(Math.random() * 60) + 40; // Simulate 40-100ms

    // In production:
    // const result = await fetch('http://ml-worker:8000/predict', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ model: slug, ticker, timestamp: Date.now() }),
    // });

    return NextResponse.json({
      model: slug,
      ticker,
      action,
      confidence,
      positionSize,
      latency,
      timestamp: new Date().toISOString(),
      note: 'This is a demo signal. Real signals available after subscription.',
    });
  } catch (error) {
    console.error('Demo error:', error);
    return NextResponse.json({ error: 'Demo failed. Please try again.' }, { status: 500 });
  }
}
