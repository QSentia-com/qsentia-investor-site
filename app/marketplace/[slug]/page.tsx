'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';
import useSWR from 'swr';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import { 
  TrendingUp, 
  ArrowLeft, 
  CheckCircle2, 
  BarChart3, 
  Zap,
  Shield,
  Clock
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ModelDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ModelDetailPage({ params }: ModelDetailPageProps) {
  const { slug } = use(params);
  const { data, error, isLoading } = useSWR(`/api/models/${slug}`, fetcher);
  const [selectedTier, setSelectedTier] = useState('pro');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  
  const model = data?.model;

  const handleFreeDemo = async () => {
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const response = await fetch(`/api/models/${slug}/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setDemoResult(data);
    } catch (err) {
      setDemoResult({ error: 'Failed to run demo' });
    } finally {
      setDemoLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <QSentiaMotionBackground />
        <div className="relative z-10 text-[var(--t2)] text-xl">Loading model...</div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <QSentiaMotionBackground />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-[var(--t1)] mb-4">Model Not Found</h1>
          <Link href="/marketplace" className="text-[var(--ac)] hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <QSentiaMotionBackground />
      
      <header className="relative z-10 bg-[var(--sur)]/80 backdrop-blur-sm border-b border-[var(--bdr)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/Qsentia Logo Bg transparent.png"
              alt="Qsentia"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-[var(--t1)]">Qsentia</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/marketplace" className="text-[var(--t2)] hover:text-[var(--t1)] transition-colors">
              Marketplace
            </Link>
            <Link href="/dashboard" className="text-[var(--t2)] hover:text-[var(--t1)] transition-colors">
              Dashboard
            </Link>
            <Link href="/research" className="text-[var(--t2)] hover:text-[var(--t1)] transition-colors">
              Research
            </Link>
            <button className="px-6 py-2 bg-[var(--ac)] text-white rounded-lg font-medium hover:bg-[var(--ac)]/90 transition-colors">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <Link 
          href="/marketplace" 
          className="inline-flex items-center gap-2 text-[var(--t2)] hover:text-[var(--ac)] mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all models
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-5xl font-bold text-[var(--t1)]">{model.name}</h1>
            <span className="px-4 py-2 bg-[var(--grb)] text-[var(--gr)] text-sm font-semibold rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--gr)] rounded-full animate-pulse"></span>
              Active
            </span>
          </div>
          <p className="text-xl text-[var(--t2)] mb-6 leading-relaxed">{model.description}</p>
          {model.tags && (
            <div className="flex flex-wrap gap-2">
              {model.tags.map((tag: string) => (
                <span key={tag} className="px-4 py-2 bg-[var(--acb)] text-[var(--ac)] text-sm font-medium rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Metrics */}
            <div className="bg-[var(--sur)] backdrop-blur-sm rounded-2xl border border-[var(--bdr)] p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-[var(--ac)]" />
                <h2 className="text-2xl font-bold text-[var(--t1)]">Performance Metrics</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="p-4 bg-[var(--bg)]/50 rounded-xl">
                  <p className="text-sm text-[var(--t3)] mb-2 font-medium">Sharpe Ratio</p>
                  <p className="text-3xl font-bold text-[var(--t1)]">{model.performance.sharpeRatio.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-[var(--bg)]/50 rounded-xl">
                  <p className="text-sm text-[var(--t3)] mb-2 font-medium">Annual Return</p>
                  <p className="text-3xl font-bold text-[var(--gr)]">
                    +{model.performance.annualizedReturn.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-[var(--bg)]/50 rounded-xl">
                  <p className="text-sm text-[var(--t3)] mb-2 font-medium">Max Drawdown</p>
                  <p className="text-3xl font-bold text-[var(--rd)]">
                    {model.performance.maxDrawdown.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-[var(--bg)]/50 rounded-xl">
                  <p className="text-sm text-[var(--t3)] mb-2 font-medium">Win Rate</p>
                  <p className="text-3xl font-bold text-[var(--t1)]">{model.performance.winRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-[var(--bg)]/50 rounded-xl">
                  <p className="text-sm text-[var(--t3)] mb-2 font-medium">Avg Hold Period</p>
                  <p className="text-3xl font-bold text-[var(--t1)]">{model.performance.avgHoldingPeriod}</p>
                </div>
                <div className="p-4 bg-[var(--bg)]/50 rounded-xl">
                  <p className="text-sm text-[var(--t3)] mb-2 font-medium">Total Signals</p>
                  <p className="text-3xl font-bold text-[var(--t1)]">{model.performance.totalSignals.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Free Demo */}
            <div className="bg-[var(--sur)] backdrop-blur-sm rounded-2xl border border-[var(--bdr)] p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-6 h-6 text-[var(--ac)]" />
                <h2 className="text-2xl font-bold text-[var(--t1)]">Try Free Demo</h2>
              </div>
              <p className="text-[var(--t2)] mb-6">
                Test the model with a free demo signal. Get a real-time prediction without signing up.
              </p>
              <button
                onClick={handleFreeDemo}
                disabled={demoLoading}
                className="w-full px-6 py-3 bg-[var(--ac)] text-white rounded-lg font-medium hover:bg-[var(--ac)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demoLoading ? 'Running Demo...' : 'Run Free Demo'}
              </button>
              {demoResult && (
                <div className="mt-6 p-6 bg-[var(--bg)]/50 rounded-xl border border-[var(--bdr)]">
                  {demoResult.error ? (
                    <p className="text-[var(--rd)]">{demoResult.error}</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[var(--t3)]">Action:</span>
                        <span className="font-bold text-[var(--t1)]">{demoResult.signal?.action || demoResult.action}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--t3)]">Confidence:</span>
                        <span className="font-bold text-[var(--t1)]">{((demoResult.signal?.confidence || demoResult.confidence) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--t3)]">Position Size:</span>
                        <span className="font-bold text-[var(--t1)]">{((demoResult.signal?.positionSize || demoResult.positionSize) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--t3)]">Latency:</span>
                        <span className="font-bold text-[var(--t1)]">{demoResult.latency}ms</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Key Features */}
            {model.features && (
              <div className="bg-[var(--sur)] backdrop-blur-sm rounded-2xl border border-[var(--bdr)] p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-6 h-6 text-[var(--ac)]" />
                  <h2 className="text-2xl font-bold text-[var(--t1)]">Key Features</h2>
                </div>
                <ul className="space-y-4">
                  {model.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--gr)] mt-0.5 flex-shrink-0" />
                      <span className="text-[var(--t2)]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Compatible Brokers */}
            {model.compatibleBrokers && (
              <div className="bg-[var(--sur)] backdrop-blur-sm rounded-2xl border border-[var(--bdr)] p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-[var(--ac)]" />
                  <h2 className="text-2xl font-bold text-[var(--t1)]">Compatible Brokers</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {model.compatibleBrokers.map((broker: string) => (
                    <div key={broker} className="p-4 bg-[var(--bg)]/50 rounded-xl text-center">
                      <p className="font-medium text-[var(--t1)]">{broker}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Use Cases */}
            {model.useCases && (
              <div className="bg-[var(--sur)] backdrop-blur-sm rounded-2xl border border-[var(--bdr)] p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-6 h-6 text-[var(--ac)]" />
                  <h2 className="text-2xl font-bold text-[var(--t1)]">Use Cases</h2>
                </div>
                <ul className="space-y-4">
                  {model.useCases.map((useCase: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-[var(--ac)] rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-[var(--t2)]">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-[var(--sur)] backdrop-blur-sm rounded-2xl border border-[var(--bdr)] p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--t1)] mb-6">Pricing Plans</h2>
              
              <div className="flex gap-2 mb-6">
                {Object.keys(model.pricing).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedTier === tier
                        ? 'bg-[var(--ac)] text-white'
                        : 'bg-[var(--bg)] text-[var(--t2)] hover:bg-[var(--bg)]/70'
                    }`}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-4xl font-bold text-[var(--t1)] mb-2">
                    ${model.pricing[selectedTier].price}
                    <span className="text-xl font-normal text-[var(--t3)]">/month</span>
                  </p>
                  <p className="text-sm text-[var(--t3)]">
                    {model.pricing[selectedTier].calls} API calls/month
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[var(--t2)]">
                    <CheckCircle2 className="w-5 h-5 text-[var(--gr)]" />
                    <span>{model.pricing[selectedTier].support}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--t2)]">
                    <CheckCircle2 className="w-5 h-5 text-[var(--gr)]" />
                    <span>Real-time signals</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--t2)]">
                    <CheckCircle2 className="w-5 h-5 text-[var(--gr)]" />
                    <span>API key included</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--t2)]">
                    <CheckCircle2 className="w-5 h-5 text-[var(--gr)]" />
                    <span>Cancel anytime</span>
                  </div>
                </div>

                <button className="w-full px-6 py-3 bg-[var(--ac)] text-white rounded-lg font-medium hover:bg-[var(--ac)]/90 transition-colors">
                  Subscribe Now
                </button>

                <p className="text-xs text-[var(--t3)] text-center">
                  14-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
