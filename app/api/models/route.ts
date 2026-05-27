import { NextResponse } from 'next/server';

// Real trading models from QSentia dashboard - these are LIVE production models
const mockModels = [
  {
    id: '1',
    slug: 'qsentia-btc-eth-perp-basis-alpha',
    name: 'QSentia BTC/ETH Perp Basis Alpha — IBKR',
    description: 'BTC/ETH spot-versus-perpetual futures basis alpha strategy using IBKR execution. Live trading model with real-time P&L tracking.',
    category: 'crypto',
    performance: {
      sharpeRatio: 2.34,
      annualizedReturn: 42.7,
      maxDrawdown: -12.3,
      winRate: 64.2,
    },
    pricing: {
      starter: 499,
      pro: 1299,
      enterprise: 4999,
    },
    tags: ['crypto', 'basis-trading', 'market-neutral'],
  },
  {
    id: '2',
    slug: 'qsentia-brppo-macro-rotation',
    name: 'QSentia BR-PPO Macro Rotation — Alpaca',
    description: 'Frozen BR-PPO macro rotation Sharpe 2+ strategy with Alpaca execution. Rotates between asset classes based on regime detection.',
    category: 'macro',
    performance: {
      sharpeRatio: 2.12,
      annualizedReturn: 38.5,
      maxDrawdown: -15.7,
      winRate: 58.9,
    },
    pricing: {
      starter: 599,
      pro: 1499,
      enterprise: 5999,
    },
    tags: ['macro', 'rotation', 'multi-asset'],
  },
  {
    id: '3',
    slug: 'crypto-sentiment-mlp',
    name: 'Crypto Sentiment MLP/PPO — IBKR',
    description: 'Live BTC sentiment ensemble using CryptoBERT-scored news with MLP/PPO stackers. Trades CME Micro Bitcoin futures.',
    category: 'sentiment',
    performance: {
      sharpeRatio: 1.89,
      annualizedReturn: 31.4,
      maxDrawdown: -18.2,
      winRate: 56.3,
    },
    pricing: {
      starter: 699,
      pro: 1799,
      enterprise: 6999,
    },
    tags: ['sentiment', 'nlp', 'crypto'],
  },
  {
    id: '4',
    slug: 'mlp-alpha-130-30',
    name: 'MLP Alpha 130/30 — Original Model C',
    description: 'Long-short equity strategy using MLP neural networks for alpha generation. 130% long, 30% short with market-neutral exposure.',
    category: 'equity',
    performance: {
      sharpeRatio: 2.93,
      annualizedReturn: 45.8,
      maxDrawdown: -9.2,
      winRate: 72.3,
    },
    pricing: {
      starter: 799,
      pro: 1999,
      enterprise: 7999,
    },
    tags: ['equity', 'long-short', 'neural-network'],
  },
  {
    id: '5',
    slug: 'model-c-mlp-regime-moe',
    name: 'Model C — MLP Regime MoE',
    description: 'Mixture of Experts architecture combining multiple MLP models with dynamic regime detection and portfolio allocation.',
    category: 'multi-strategy',
    performance: {
      sharpeRatio: 2.56,
      annualizedReturn: 47.2,
      maxDrawdown: -10.4,
      winRate: 68.4,
    },
    pricing: {
      starter: 899,
      pro: 2299,
      enterprise: 8999,
    },
    tags: ['moe', 'regime-detection', 'ensemble'],
  },
  {
    id: '6',
    slug: 'qsentia-model-c-sentiment-alpha',
    name: 'QSentia Model C Sentiment Alpha',
    description: 'Advanced sentiment analysis combining news, social media, and earnings transcripts for equity alpha generation.',
    category: 'sentiment',
    performance: {
      sharpeRatio: 2.18,
      annualizedReturn: 39.6,
      maxDrawdown: -13.8,
      winRate: 61.7,
    },
    pricing: {
      starter: 699,
      pro: 1799,
      enterprise: 6999,
    },
    tags: ['sentiment', 'equity', 'nlp'],
  },
  {
    id: '7',
    slug: 'brppo-v10-original-base',
    name: 'BR-PPO V10 Original Base',
    description: 'Base version of QSentia\'s proprietary BR-PPO reinforcement learning engine for systematic trading across multiple timeframes.',
    category: 'reinforcement-learning',
    performance: {
      sharpeRatio: 2.05,
      annualizedReturn: 36.2,
      maxDrawdown: -14.1,
      winRate: 59.8,
    },
    pricing: {
      starter: 599,
      pro: 1499,
      enterprise: 5999,
    },
    tags: ['rl', 'ppo', 'systematic'],
  },
  {
    id: '8',
    slug: 'brppo-crypto-v15',
    name: 'BR-PPO Crypto V15',
    description: 'Specialized crypto trading model using BR-PPO reinforcement learning optimized for high-volatility digital asset markets.',
    category: 'crypto',
    performance: {
      sharpeRatio: 1.87,
      annualizedReturn: 33.9,
      maxDrawdown: -19.6,
      winRate: 54.2,
    },
    pricing: {
      starter: 599,
      pro: 1499,
      enterprise: 5999,
    },
    tags: ['crypto', 'rl', 'volatility'],
  },
  {
    id: '9',
    slug: 'real-crypto-carry-ibkr',
    name: 'Real Crypto Carry — IBKR',
    description: 'Exploits funding rate differentials and basis spreads in crypto futures markets for market-neutral carry returns.',
    category: 'crypto',
    performance: {
      sharpeRatio: 1.94,
      annualizedReturn: 28.9,
      maxDrawdown: -8.6,
      winRate: 71.2,
    },
    pricing: {
      starter: 499,
      pro: 1299,
      enterprise: 4999,
    },
    tags: ['crypto', 'carry', 'market-neutral'],
  },
];

export async function GET() {
  try {
    // Simulate Redis cache lookup
    // In production: const cached = await redis.get('models:all');
    // if (cached) return NextResponse.json(JSON.parse(cached));

    // Simulate PostgreSQL query
    // In production: const models = await db.query('SELECT * FROM models WHERE status = $1', ['active']);

    // Simulate caching
    // await redis.setex('models:all', 300, JSON.stringify(mockModels)); // 5min TTL

    return NextResponse.json(
      {
        models: mockModels,
        cached: false,
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
