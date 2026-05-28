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
  Clock,
  Cpu,
  Layers,
  Sparkles,
  Terminal as TerminalIcon,
  Play
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
      <div className="min-h-screen bg-[#060814] flex flex-col items-center justify-center relative">
        <QSentiaMotionBackground />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 border-t-2 border-indigo-500 border-r-2 border-indigo-500/30 rounded-full animate-spin"></div>
          <div className="text-indigo-300 text-sm font-mono tracking-widest uppercase">Initializing Neural Connection...</div>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-[#060814] flex items-center justify-center relative">
        <QSentiaMotionBackground />
        <div className="relative z-10 text-center bg-[#080c22]/60 backdrop-blur-xl border border-white/5 p-12 rounded-2xl max-w-md shadow-2xl">
          <Layers className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Model Not Found</h1>
          <p className="text-gray-400 text-sm mb-8">The requested intelligence model does not exist or has been deprecated from the active cluster index.</p>
          <Link href="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060814] text-[#eceefb] relative overflow-hidden selection:bg-[#4f46e5]/40 selection:text-white">
      <QSentiaMotionBackground />

      {/* Futuristic Glow Layers */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#4f46e5]/5 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#7c3aed]/5 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] rounded-full bg-[#00d9ff]/5 blur-[150px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="border-b border-white/5 bg-[#080b20]/60 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-indigo-500/50 transition-all duration-300">
              <Image
                src="/logo/Qsentia Logo Bg transparent.png"
                alt="Qsentia"
                width={36}
                height={36}
                className="w-9 h-9 transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Qsentia<span className="text-xs font-mono px-2 py-0.5 ml-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">CORE</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/marketplace" className="text-indigo-300 font-medium hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/research" className="text-gray-400 hover:text-white transition-colors">
              Research
            </Link>
            <div className="h-4 w-px bg-white/10"></div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg transition-all font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-12 z-10">
        
        {/* Navigation Breadcrumb */}
        <Link 
          href="/marketplace" 
          className="inline-flex items-center gap-2 text-indigo-300 hover:text-white mb-8 transition-colors font-medium text-sm group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          Back to Model Registry
        </Link>

        {/* Model Hero Banner */}
        <div className="mb-12 border-b border-white/5 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">{model.name}</h1>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono tracking-wider font-semibold rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                ACTIVE ENDPOINT
              </span>
            </div>
            {/* Quick response stats */}
            <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
              <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg">GPU Cluster Standard</span>
              <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg">HTTP API</span>
            </div>
          </div>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl leading-relaxed mb-6">
            {model.description}
          </p>

          {/* Long Description Text Block */}
          {model.longDescription && (
            <p className="text-gray-400 max-w-4xl text-sm leading-relaxed mb-8 border-l-2 border-indigo-500/30 pl-4 whitespace-pre-wrap">
              {model.longDescription}
            </p>
          )}

          {model.tags && (
            <div className="flex flex-wrap gap-2">
              {model.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Performance Metrics */}
            <div className="bg-[#080c22]/40 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Backtested & Production Metrics</h2>
                  <p className="text-xs text-gray-400">Audited operational metrics synced daily with portfolio tracking</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0a0d28]/60 border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all duration-300">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Sharpe Ratio</p>
                  <p className="text-2xl font-bold text-white">{model.performance.sharpeRatio.toFixed(2)}</p>
                </div>
                
                <div className="p-4 bg-[#0a0d28]/60 border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all duration-300">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Annualized Return</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    +{model.performance.annualizedReturn.toFixed(1)}%
                  </p>
                </div>
                
                <div className="p-4 bg-[#0a0d28]/60 border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all duration-300">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Max Drawdown</p>
                  <p className="text-2xl font-bold text-rose-500">
                    {model.performance.maxDrawdown.toFixed(1)}%
                  </p>
                </div>
                
                <div className="p-4 bg-[#0a0d28]/60 border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all duration-300">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Win Rate</p>
                  <p className="text-2xl font-bold text-white">{model.performance.winRate.toFixed(1)}%</p>
                </div>
                
                <div className="p-4 bg-[#0a0d28]/60 border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all duration-300">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Average Hold Period</p>
                  <p className="text-2xl font-bold text-white">{model.performance.avgHoldingPeriod}</p>
                </div>
                
                <div className="p-4 bg-[#0a0d28]/60 border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all duration-300">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Inference Signals</p>
                  <p className="text-2xl font-bold text-white">{model.performance.totalSignals.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Free Demo with Interactive Terminal */}
            <div className="bg-[#080c22]/40 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                    <TerminalIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Neural Endpoint Sandbox</h2>
                    <p className="text-xs text-gray-400">Trigger live single-inference mock calls to test payload structure</p>
                  </div>
                </div>
                
                <div className="text-xs text-indigo-300 font-mono">
                  POST /api/v1/infer
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-6">
                Receive the latest trading signal generation vector. Endpoints are strictly rate-limited to 5 free trials per hour per client session.
              </p>
              
              <button
                onClick={handleFreeDemo}
                disabled={demoLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:cursor-not-allowed group cursor-pointer"
              >
                {demoLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Executing GPU Inference Vector...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current transform group-hover:scale-110 transition-transform" />
                    Query Active Inference API
                  </>
                )}
              </button>

              {demoResult && (
                <div className="mt-6 border border-white/5 rounded-xl overflow-hidden bg-[#040614]/80 shadow-2xl font-mono text-sm leading-relaxed">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                    <span className="text-xs text-gray-500 font-semibold">TERMINAL OUTPUT</span>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  </div>
                  
                  {demoResult.error ? (
                    <div className="p-4 text-rose-400">
                      Error: {demoResult.error}
                    </div>
                  ) : (
                    <pre className="p-5 overflow-x-auto text-[13px] text-gray-300 whitespace-pre">
{`{
  "api_version": "2026.05.28",
  "status": "success",
  "deployment": "qsentia-cluster-${slug}",
  "latency": "${demoResult.latency}ms",
  "inference_timestamp": "${new Date().toISOString()}",
  "signal": {
    "action": "${demoResult.signal?.action || demoResult.action || 'HOLD'}",
    "confidence": ${demoResult.signal?.confidence || demoResult.confidence || 0.742},
    "allocation_weight": ${demoResult.signal?.positionSize || demoResult.positionSize || 0.100},
    "risk_mitigation": {
      "stop_loss_trigger": "price_offset_0_02",
      "vol_cap_multiplier": 0.85
    }
  }
}`}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Key Features */}
            {model.features && (
              <div className="bg-[#080c22]/40 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Tactical Features & Controls</h2>
                    <p className="text-xs text-gray-400">Core architecture built within active model endpoints</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {model.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compatible Brokers */}
            {model.compatibleBrokers && (
              <div className="bg-[#080c22]/40 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Certified Broker Connectivity</h2>
                    <p className="text-xs text-gray-400">Integrated microservices ready for major APIs & execution centers</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {model.compatibleBrokers.map((broker: string) => (
                    <div key={broker} className="p-3.5 bg-[#0a0d28]/60 border border-white/5 rounded-xl text-center hover:border-indigo-500/20 transition-all hover:scale-102">
                      <p className="font-semibold text-xs text-white tracking-wider uppercase">{broker}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Use Cases */}
            {model.useCases && (
              <div className="bg-[#080c22]/40 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Structured Use Cases</h2>
                    <p className="text-xs text-gray-400">Recommended tactical trading applications</p>
                  </div>
                </div>
                
                <ul className="space-y-3.5">
                  {model.useCases.map((useCase: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-xl">
                      <span className="w-2 h-2 bg-indigo-450 rounded-full mt-2 flex-shrink-0 animate-pulse"></span>
                      <span className="text-sm text-gray-300 leading-relaxed">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Pricing Sidebar Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-[#080c22]/50 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-450" />
                Select Licensing Plan
              </h2>
              
              {/* Plan Tabs */}
              <div className="flex gap-1.5 p-1 bg-[#040614]/80 rounded-xl border border-white/5 mb-6">
                {Object.keys(model.pricing).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedTier === tier
                        ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </button>
                ))}
              </div>

              {/* Price Details */}
              <div className="space-y-6">
                <div className="p-4 bg-[#0a0d28]/80 border border-white/5 rounded-xl">
                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <span className="text-4xl font-bold text-white tracking-tight">${model.pricing[selectedTier].price}</span>
                    <span className="text-sm text-gray-500 font-medium">/month</span>
                  </div>
                  <p className="text-xs text-indigo-300 font-mono">
                    {model.pricing[selectedTier].calls} API inference calls/mo
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{model.pricing[selectedTier].support}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Real-time live-vector signals</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>WebSocket & REST access</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Custom safety factor triggers</span>
                  </div>
                </div>

                <button className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-0.5 cursor-pointer">
                  Activate Endpoint Now
                </button>

                <p className="text-[10px] text-gray-500 text-center uppercase tracking-wider font-mono">
                  Secure instant API token generation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
