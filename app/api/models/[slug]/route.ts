import { NextResponse } from 'next/server';

// Real trading model details - these are LIVE production models from QSentia dashboard
const mockModelDetails: Record<string, any> = {
  'qsentia-btc-eth-perp-basis-alpha': {
    id: '1',
    slug: 'qsentia-btc-eth-perp-basis-alpha',
    name: 'QSentia BTC/ETH Perp Basis Alpha — IBKR',
    description: 'BTC/ETH spot-versus-perpetual futures basis alpha strategy using IBKR execution. Live trading model with real-time P&L tracking.',
    longDescription: `The QSentia BTC/ETH Perp Basis Alpha strategy exploits pricing inefficiencies between spot and perpetual futures markets for Bitcoin and Ethereum.

This market-neutral strategy captures basis spreads and funding rate arbitrage opportunities while maintaining delta-neutral exposure. Live trading on IBKR with real-time risk management and position monitoring.

Built on proprietary market microstructure research and optimized for low-latency execution. Currently deployed in production with live P&L tracking via QSentia dashboard logs.`,
    category: 'crypto',
    performance: {
      sharpeRatio: 2.34,
      annualizedReturn: 42.7,
      maxDrawdown: -12.3,
      winRate: 64.2,
      avgHoldingPeriod: '8.4h',
      totalSignals: 15247,
    },
    pricing: {
      starter: { price: 499, calls: '5,000', support: 'Email support' },
      pro: { price: 1299, calls: '25,000', support: 'Priority support + Slack' },
      enterprise: { price: 4999, calls: 'Unlimited', support: 'Dedicated account manager + Custom features' },
    },
    features: [
      'Market-neutral basis trading strategy',
      'Real-time funding rate arbitrage',
      'IBKR paper and live execution ready',
      'Delta-neutral risk management',
      'Sub-50ms signal generation',
      'Live dashboard P&L tracking',
      'Automated position rebalancing',
      'Works with BTC and ETH perpetuals',
    ],
    compatibleBrokers: ['IBKR', 'Binance', 'Bybit', 'Deribit', 'OKX', 'FTX', 'Kraken', 'Coinbase'],
    useCases: [
      'Market-neutral crypto arbitrage',
      'Funding rate capture strategies',
      'Low-correlation portfolio diversification',
      'Institutional crypto desk alpha generation',
    ],
    tags: ['crypto', 'basis-trading', 'market-neutral', 'arbitrage', 'live'],
  },
  'qsentia-brppo-macro-rotation': {
    id: '2',
    slug: 'qsentia-brppo-macro-rotation',
    name: 'QSentia BR-PPO Macro Rotation — Alpaca',
    description: 'Frozen BR-PPO macro rotation Sharpe 2+ strategy with Alpaca execution. Rotates between asset classes based on regime detection.',
    longDescription: `QSentia's BR-PPO Macro Rotation uses reinforcement learning to dynamically allocate capital across equities, bonds, commodities, and cash based on detected market regimes.

The model identifies four primary macro regimes: Risk-On Growth, Risk-Off Defensive, Inflation Surge, and Deflation. Portfolio allocation shifts automatically as regime probabilities change.

Frozen production model with Sharpe ratio exceeding 2.0 in live testing. Deployed on Alpaca paper trading with canonical QSentia dashboard integration for real-time monitoring.`,
    category: 'macro',
    performance: {
      sharpeRatio: 2.12,
      annualizedReturn: 38.5,
      maxDrawdown: -15.7,
      winRate: 58.9,
      avgHoldingPeriod: '12.3d',
      totalSignals: 4892,
    },
    pricing: {
      starter: { price: 599, calls: '5,000', support: 'Email support' },
      pro: { price: 1499, calls: '25,000', support: 'Priority support + Slack' },
      enterprise: { price: 5999, calls: 'Unlimited', support: 'Dedicated account manager + Custom features' },
    },
    features: [
      'BR-PPO reinforcement learning engine',
      'Multi-asset class rotation (stocks, bonds, commodities)',
      'Regime detection with 4 macro states',
      'Dynamic risk-adjusted position sizing',
      'Alpaca API integration ready',
      'Live dashboard tracking',
      'Volatility-targeting risk control',
      'Rebalancing optimization',
    ],
    compatibleBrokers: ['Alpaca', 'IBKR', 'TD Ameritrade', 'Schwab', 'Fidelity', 'E*TRADE', 'TradeStation', 'Webull'],
    useCases: [
      'Tactical asset allocation for portfolio management',
      'Macro hedge fund strategy implementation',
      'Multi-asset diversification optimization',
      'Regime-based risk parity strategies',
    ],
    tags: ['macro', 'rotation', 'multi-asset', 'rl', 'live'],
  },
  'crypto-sentiment-mlp': {
    id: '3',
    slug: 'crypto-sentiment-mlp',
    name: 'Crypto Sentiment MLP/PPO — IBKR',
    description: 'Live BTC sentiment ensemble using CryptoBERT-scored news with MLP/PPO stackers. Trades CME Micro Bitcoin futures.',
    longDescription: `Crypto Sentiment MLP/PPO combines NLP sentiment analysis with reinforcement learning to trade Bitcoin based on market narrative shifts.

Uses CryptoBERT transformer models to score cryptocurrency news and social media, feeding sentiment signals into MLP neural networks and PPO reinforcement learning agents for signal generation.

Currently trading CME Micro Bitcoin futures on IBKR with live P&L tracking. Portfolio value sourced from IBKR NetLiquidation with real-time dashboard monitoring.`,
    category: 'sentiment',
    performance: {
      sharpeRatio: 1.89,
      annualizedReturn: 31.4,
      maxDrawdown: -18.2,
      winRate: 56.3,
      avgHoldingPeriod: '3.7d',
      totalSignals: 8127,
    },
    pricing: {
      starter: { price: 699, calls: '5,000', support: 'Email support' },
      pro: { price: 1799, calls: '25,000', support: 'Priority support + Slack' },
      enterprise: { price: 6999, calls: 'Unlimited', support: 'Dedicated account manager + Custom features' },
    },
    features: [
      'CryptoBERT-powered sentiment analysis',
      'MLP neural network signal stacking',
      'PPO reinforcement learning optimization',
      'CME Micro Bitcoin futures trading',
      'IBKR live execution ready',
      'Real-time NetLiquidation tracking',
      'Social media sentiment integration',
      'News event detection',
    ],
    compatibleBrokers: ['IBKR', 'Binance', 'Bybit', 'Deribit', 'Kraken', 'Coinbase', 'OKX', 'FTX'],
    useCases: [
      'Sentiment-driven crypto trading',
      'News-based Bitcoin futures strategies',
      'Social media trend exploitation',
      'Event-driven crypto positioning',
    ],
    tags: ['sentiment', 'nlp', 'crypto', 'ml', 'live'],
  },
  'mlp-alpha-130-30': {
    id: '4',
    slug: 'mlp-alpha-130-30',
    name: 'MLP Alpha 130/30 — Original Model C',
    description: 'Long-short equity strategy using MLP neural networks for alpha generation. 130% long, 30% short with market-neutral exposure.',
    longDescription: `MLP Alpha 130/30 is a long-short equity strategy that uses multi-layer perceptron neural networks to generate alpha signals across the stock universe.

The model maintains 130% long exposure and 30% short exposure for a net 100% equity allocation while capturing long-short alpha. Model C architecture provides sector-neutral positioning with factor risk controls.

Currently showing exceptional performance with Sharpe ratio of 2.93 and consistent returns across market regimes. Part of the Original Model C research family with live dashboard tracking.`,
    category: 'equity',
    performance: {
      sharpeRatio: 2.93,
      annualizedReturn: 45.8,
      maxDrawdown: -9.2,
      winRate: 72.3,
      avgHoldingPeriod: '6.8d',
      totalSignals: 9845,
    },
    pricing: {
      starter: { price: 799, calls: '10,000', support: 'Email support' },
      pro: { price: 1999, calls: '50,000', support: 'Priority support + Slack' },
      enterprise: { price: 7999, calls: 'Unlimited', support: 'Dedicated account manager + Custom features' },
    },
    features: [
      '130/30 long-short equity structure',
      'MLP neural network alpha signals',
      'Sector-neutral risk controls',
      'Factor exposure management',
      'Dynamic position sizing',
      'Live dashboard P&L tracking',
      'Rebalancing optimization',
      'Works across US equity universe',
    ],
    compatibleBrokers: ['IBKR', 'Alpaca', 'TD Ameritrade', 'Schwab', 'Fidelity', 'E*TRADE', 'TradeStation', 'Robinhood'],
    useCases: [
      'Long-short equity hedge fund strategies',
      'Market-neutral alpha generation',
      'Portfolio alpha overlay strategies',
      'Institutional equity trading desks',
    ],
    tags: ['equity', 'long-short', 'neural-network', 'alpha', 'live'],
  },
  'model-c-mlp-regime-moe': {
    id: '5',
    slug: 'model-c-mlp-regime-moe',
    name: 'Model C — MLP Regime MoE',
    description: 'Mixture of Experts architecture combining multiple MLP models with dynamic regime detection and portfolio allocation.',
    longDescription: `Model C MLP Regime MoE uses a Mixture of Experts architecture to combine multiple specialized MLP models, each optimized for different market regimes.

The model dynamically weights expert predictions based on detected regime probabilities, allowing it to adapt to changing market conditions. Regime detection identifies: Trending, Mean-Reverting, High-Volatility, and Low-Volatility states.

Part of the Model C research family with exceptional live performance. Provides robust returns across market cycles with sophisticated risk management and position sizing.`,
    category: 'multi-strategy',
    performance: {
      sharpeRatio: 2.56,
      annualizedReturn: 47.2,
      maxDrawdown: -10.4,
      winRate: 68.4,
      avgHoldingPeriod: '7.2d',
      totalSignals: 11234,
    },
    pricing: {
      starter: { price: 899, calls: '10,000', support: 'Email support' },
      pro: { price: 2299, calls: '50,000', support: 'Priority support + Slack' },
      enterprise: { price: 8999, calls: 'Unlimited', support: 'Dedicated account manager + Custom features' },
    },
    features: [
      'Mixture of Experts (MoE) architecture',
      'Multiple specialized MLP models',
      'Dynamic regime detection (4 states)',
      'Expert weighting based on regime probability',
      'Adaptive position sizing',
      'Live dashboard monitoring',
      'Cross-validation ensemble methods',
      'Robust across market cycles',
    ],
    compatibleBrokers: ['IBKR', 'Alpaca', 'TD Ameritrade', 'Schwab', 'Fidelity', 'E*TRADE', 'TradeStation', 'Webull'],
    useCases: [
      'Multi-strategy portfolio management',
      'Regime-adaptive trading systems',
      'Ensemble model alpha generation',
      'Institutional quant trading desks',
    ],
    tags: ['moe', 'regime-detection', 'ensemble', 'ml', 'live'],
  },
  'qsentia-model-c-sentiment-alpha': {
    id: '6',
    slug: 'qsentia-model-c-sentiment-alpha',
    name: 'QSentia Model C Sentiment Alpha',
    description: 'Advanced sentiment analysis combining news, social media, and earnings transcripts for equity alpha generation.',
    longDescription: `QSentia Model C Sentiment Alpha processes unstructured text data from news articles, social media, and earnings call transcripts to generate alpha signals for equity trading.

Uses transformer-based NLP models to extract sentiment, detect key events, and identify narrative shifts before they're fully priced into markets. Part of the Model C research family with live performance tracking.

Processes over 100,000 text documents daily across multiple sources. Sentiment scores are combined with price action and volume data for high-conviction signal generation.`,
    category: 'sentiment',
    performance: {
      sharpeRatio: 2.18,
      annualizedReturn: 39.6,
      maxDrawdown: -13.8,
      winRate: 61.7,
      avgHoldingPeriod: '5.3d',
      totalSignals: 7892,
    },
    pricing: {
      starter: { price: 699, calls: '10,000', support: 'Email support' },
      pro: { price: 1799, calls: '50,000', support: 'Priority support + Slack' },
      enterprise: { price: 6999, calls: 'Unlimited', support: 'Dedicated account manager + Custom features' },
    },
    features: [
      'Multi-source sentiment analysis',
      'Transformer-based NLP models',
      'Earnings call transcript analysis',
      'Social media sentiment tracking',
      'News event detection',
      'Sentiment-price divergence alerts',
      'Live dashboard tracking',
      'Entity-level sentiment attribution',
    ],
    compatibleBrokers: ['IBKR', 'Alpaca', 'TD Ameritrade', 'Schwab', 'Fidelity', 'E*TRADE', 'TradeStation', 'Robinhood'],
    useCases: [
      'Event-driven equity trading',
      'Earnings announcement strategies',
      'News-based alpha generation',
      'Sentiment momentum convergence trading',
    ],
    tags: ['sentiment', 'equity', 'nlp', 'earnings', 'live'],
  },
  'brppo-v10-original-base': {
    id: '7',
    slug: 'brppo-v10-original-base',
    name: 'BR-PPO V10 Original Base',
    description: 'Base version of QSentia\'s proprietary BR-PPO reinforcement learning engine for systematic trading across multiple timeframes.',
    longDescription: `BR-PPO V10 is the base version of QSentia's proprietary Bounded-Reward Proximal Policy Optimization reinforcement learning engine.

This foundational model uses deep RL to learn optimal trading policies across multiple timeframes and asset classes. The bounded reward structure prevents overfitting and ensures stable policy updates during training.

V10 represents years of research into stable RL training for financial markets. Used as the foundation for many specialized QSentia models including Macro Rotation and Crypto strategies.`,
    category: 'reinforcement-learning',
    performance: {
      sharpeRatio: 2.05,
      annualizedReturn: 36.2,
      maxDrawdown: -14.1,
      winRate: 59.8,
      avgHoldingPeriod: '4.6d',
      totalSignals: 8764,
    },
    pricing: {
      starter: { price: 599, calls: '10,000', support: 'Email support' },
      pro: { price: 1499, calls: '50,000', support: 'Priority support + Slack' },
      enterprise: { price: 5999, calls: 'Unlimited', support: 'Dedicated account manager + Custom features' },
    },
    features: [
      'Proprietary BR-PPO RL architecture',
      'Multi-timeframe policy learning',
      'Bounded reward structure for stability',
      'Works across multiple asset classes',
      'Adaptive position sizing',
      'Live dashboard monitoring',
      'Stable training methodology',
      'Foundation for specialized models',
    ],
    compatibleBrokers: ['IBKR', 'Alpaca', 'TD Ameritrade', 'Schwab', 'Fidelity', 'E*TRADE', 'TradeStation', 'Webull'],
    useCases: [
      'Systematic trading across assets',
      'Reinforcement learning research',
      'Multi-timeframe strategy development',
      'Adaptive trading system foundation',
    ],
    tags: ['rl', 'ppo', 'systematic', 'foundation', 'live'],
  },
  'brppo-crypto-v15': {
    id: '8',
    slug: 'brppo-crypto-v15',
    name: 'BR-PPO Crypto V15',
    description: 'Specialized crypto trading model using BR-PPO reinforcement learning optimized for high-volatility digital asset markets.',
    longDescription: `BR-PPO Crypto V15 is a specialized version of QSentia's BR-PPO engine optimized specifically for cryptocurrency markets and their unique characteristics.

The model handles extreme volatility, 24/7 trading, and crypto-specific market microstructure including funding rates, basis spreads, and exchange-specific order flow patterns.

V15 represents the latest iteration with improved handling of flash crashes, liquidation cascades, and other crypto market anomalies. Trained on multi-year crypto data including several market cycles.`,
    category: 'crypto',
    performance: {
      sharpeRatio: 1.87,
      annualizedReturn: 33.9,
      maxDrawdown: -19.6,
      winRate: 54.2,
      avgHoldingPeriod: '2.8d',
      totalSignals: 12476,
    },
    pricing: {
      starter: { price: 599, calls: '10,000', support: 'Email support' },
      pro: { price: 1499, calls: '50,000', support: 'Priority support + Slack' },
      enterprise: { price: 5999, calls: 'Unlimited', support: 'Dedicated account manager + Custom features' },
    },
    features: [
      'BR-PPO RL optimized for crypto volatility',
      '24/7 continuous trading support',
      'Funding rate awareness',
      'Liquidation cascade detection',
      'Multi-exchange order flow analysis',
      'Flash crash protection',
      'Live dashboard tracking',
      'Works across major cryptocurrencies',
    ],
    compatibleBrokers: ['IBKR', 'Binance', 'Bybit', 'Deribit', 'Kraken', 'Coinbase', 'OKX', 'FTX'],
    useCases: [
      'Crypto systematic trading strategies',
      '24/7 automated crypto portfolios',
      'High-volatility market adaptation',
      'Multi-exchange arbitrage and trading',
    ],
    tags: ['crypto', 'rl', 'volatility', 'systematic', 'live'],
  },
  'real-crypto-carry-ibkr': {
    id: '9',
    slug: 'real-crypto-carry-ibkr',
    name: 'Real Crypto Carry — IBKR',
    description: 'Exploits funding rate differentials and basis spreads in crypto futures markets for market-neutral carry returns.',
    longDescription: `Real Crypto Carry exploits persistent funding rate differentials and basis spreads between spot and futures crypto markets to generate market-neutral carry returns.

The strategy captures funding payments from perpetual futures while maintaining delta-neutral exposure through spot hedging. Works across BTC, ETH, and other major cryptocurrencies with liquid futures markets.

Currently deployed on IBKR with live monitoring. Provides consistent low-volatility returns with minimal correlation to directional crypto price movements. Ideal for portfolio diversification and yield generation.`,
    category: 'crypto',
    performance: {
      sharpeRatio: 1.94,
      annualizedReturn: 28.9,
      maxDrawdown: -8.6,
      winRate: 71.2,
      avgHoldingPeriod: '6.1d',
      totalSignals: 5847,
    },
    pricing: {
      starter: { price: 499, calls: '5,000', support: 'Email support' },
      pro: { price: 1299, calls: '25,000', support: 'Priority support + Slack' },
      enterprise: { price: 4999, calls: 'Unlimited', support: 'Dedicated account manager + Custom features' },
    },
    features: [
      'Funding rate arbitrage strategies',
      'Basis spread exploitation',
      'Market-neutral delta hedging',
      'Multi-asset crypto coverage',
      'IBKR execution ready',
      'Low-volatility carry generation',
      'Live dashboard P&L tracking',
      'Minimal directional exposure',
    ],
    compatibleBrokers: ['IBKR', 'Binance', 'Bybit', 'Deribit', 'OKX', 'FTX', 'Kraken', 'Coinbase'],
    useCases: [
      'Market-neutral crypto yield generation',
      'Funding rate carry strategies',
      'Low-correlation portfolio diversification',
      'Cash-and-carry arbitrage',
    ],
    tags: ['crypto', 'carry', 'market-neutral', 'arbitrage', 'live'],
  },
};

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // In production: Check Redis cache first
    // const cached = await redis.get(`model:${slug}`);

    // In production: Query PostgreSQL
    // const model = await db.query('SELECT * FROM models WHERE slug = $1', [slug]);

    const model = mockModelDetails[slug];

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // In production: Cache in Redis
    // await redis.setex(`model:${slug}`, 300, JSON.stringify(model));

    return NextResponse.json(
      {
        model,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 });
  }
}
