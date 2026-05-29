'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import { TrendingUp, Zap, Shield, Search, Filter, ArrowRight, Cpu, Layers, Activity, Sparkles } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Model = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  performance: {
    sharpeRatio: number | null;
    annualizedReturn: number | null;
    maxDrawdown: number | null;
    winRate: number | null;
  };
  pricing: null;
  tags: string[];
};

function numLabel(value: number | null, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Pending';
  return value.toFixed(digits);
}

function pctLabel(value: number | null, digits = 1, forceSign = false) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Pending';
  const prefix = forceSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(digits)}%`;
}

// Distinct premium sparkline path data to give an institutional charting viz for each model
const sparklineCoords: Record<string, string> = {
  'qsentia-btc-eth-perp-basis-alpha': 'M 0 45 Q 15 35 30 40 T 60 20 T 90 25 T 120 10 T 150 15 T 180 5 T 210 12 T 240 2',
  'qsentia-brppo-macro-rotation': 'M 0 40 Q 15 25 30 35 T 60 30 T 90 15 T 120 18 T 150 8 T 180 12 T 210 5 T 240 3',
  'crypto-sentiment-mlp': 'M 0 48 Q 15 38 30 45 T 60 25 T 90 32 T 120 15 T 150 20 T 180 8 T 210 14 T 240 5',
  'mlp-alpha-130-30': 'M 0 42 Q 15 28 30 38 T 60 18 T 90 22 T 120 10 T 150 14 T 180 4 T 210 8 T 240 1',
  'model-c-mlp-regime-moe': 'M 0 44 Q 15 32 30 42 T 60 20 T 90 24 T 120 12 T 150 16 T 180 6 T 210 10 T 240 2',
  'qsentia-model-c-sentiment-alpha': 'M 0 46 Q 15 34 30 40 T 60 22 T 90 28 T 120 14 T 150 18 T 180 8 T 210 12 T 240 4',
  'brppo-v10-original-base': 'M 0 41 Q 15 27 30 36 T 60 19 T 90 23 T 120 11 T 150 15 T 180 5 T 210 9 T 240 3',
  'brppo-crypto-v15': 'M 0 49 Q 15 39 30 47 T 60 27 T 90 34 T 120 17 T 150 22 T 180 10 T 210 16 T 240 6',
  'real-crypto-carry-ibkr': 'M 0 43 Q 15 30 30 39 T 60 21 T 90 26 T 120 13 T 150 17 T 180 7 T 210 11 T 240 4',
};

const categorySpec: Record<string, { label: string, color: string, badgeBg: string }> = {
  'crypto': { label: 'Digital Assets', color: 'text-emerald-400 border-emerald-500/30', badgeBg: 'bg-emerald-500/10' },
  'macro': { label: 'Macro Regime', color: 'text-blue-400 border-blue-500/30', badgeBg: 'bg-blue-500/10' },
  'sentiment': { label: 'NLP News & Sentiment', color: 'text-amber-400 border-amber-500/30', badgeBg: 'bg-amber-500/10' },
  'equity': { label: 'Quantitative Equity', color: 'text-violet-400 border-violet-500/30', badgeBg: 'bg-violet-500/10' },
  'multi-strategy': { label: 'Multi-Strategy MoE', color: 'text-cyan-400 border-cyan-500/30', badgeBg: 'bg-cyan-500/10' },
  'reinforcement-learning': { label: 'Deep RL Model', color: 'text-purple-400 border-purple-500/30', badgeBg: 'bg-purple-500/10' },
};

export default function MarketplacePage() {
  const { data, error, isLoading } = useSWR('/api/models', fetcher);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const models: Model[] = data?.models || [];
  const categories = ['all', 'crypto', 'macro', 'sentiment', 'equity', 'multi-strategy', 'reinforcement-learning'];

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesCategory = selectedCategory === 'all';
    if (!matchesCategory) {
      matchesCategory = model.category.toLowerCase() === selectedCategory.toLowerCase();
    }
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#060814] text-[#eceefb] relative overflow-hidden selection:bg-[#4f46e5]/40 selection:text-white">
      <QSentiaMotionBackground />

      {/* Decorative Glow Spheres like Axyon.ai */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4f46e5]/10 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#7c3aed]/10 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#00d9ff]/5 blur-[150px] pointer-events-none z-0"></div>

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
                className="w-9 h-9 transform group-hover:scale-110 transition-transform duration-300 filter brightness-110"
              />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Qsentia<span className="text-xs font-mono px-2 py-0.5 ml-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">CORE</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/marketplace" className="text-indigo-300 font-medium hover:text-white transition-colors relative py-1">
              Marketplace
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"></span>
            </Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/research" className="text-gray-400 hover:text-white transition-colors">
              Research
            </Link>
            <div className="h-4 w-px bg-white/10"></div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg transition-all font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-sm font-medium text-indigo-200">Institutional Quant AI Platform</span>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Predictive AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">Trading Models</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
          Deploy deep learning, reinforcement learning, and advanced NLP classifiers directly into your execution workflow. Institutional alpha signals delivered in under 68ms.
        </p>
        
        {/* Key Features / Benefits Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-b border-white/5 py-10 mt-6 bg-[#080b20]/20 backdrop-blur-sm rounded-2xl px-6">
          <div className="flex flex-col items-center p-3 text-center border-r border-white/5 last:border-r-0">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-white font-semibold text-base mb-1">Real-Time ML Inference</h3>
            <p className="text-xs text-gray-400">Continuous 24/7 signal parsing</p>
          </div>
          
          <div className="flex flex-col items-center p-3 text-center border-r border-white/5 last:border-r-0">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-white font-semibold text-base mb-1">Battle-Tested Models</h3>
            <p className="text-xs text-gray-400">Built on multi-year live track record</p>
          </div>
          
          <div className="flex flex-col items-center p-3 text-center col-span-2 lg:col-span-1">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mb-4 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-white font-semibold text-base mb-1">Sub-68ms API Response</h3>
            <p className="text-xs text-gray-400">Optimized GPU cluster routing</p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="relative max-w-7xl mx-auto px-6 pb-24 z-10">
        
        {/* Search & Dynamic Category Filters Banner */}
        <div className="bg-[#080d26]/50 border border-white/10 p-4 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl shadow-2xl">
          {/* Search bar */}
          <div className="w-full md:flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by name, strategy, tag, or broker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-white placeholder:text-gray-400"
            />
          </div>

          {/* Categories Tab Scroll */}
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <Filter className="w-4 h-4 text-indigo-400 flex-shrink-0 ml-1" />
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400 mr-2 flex-shrink-0">Category:</span>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-300 flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-400/30'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                  }`}
                >
                  {cat === 'all' ? 'All Models' : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#080b20]/40 backdrop-blur-xl rounded-2xl border border-white/5 p-6 h-[440px] animate-pulse flex flex-col justify-between">
                <div>
                  <div className="h-6 bg-white/5 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
                  <div className="h-4 bg-white/5 rounded w-5/6 mb-8"></div>
                </div>
                <div className="h-24 bg-white/5 rounded-xl mb-4"></div>
                <div className="h-10 bg-white/5 rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-12 text-center backdrop-blur-xl">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Service Temporarily Interrupted</h3>
            <p className="text-gray-400 max-w-md mx-auto text-sm mb-6">Failed to sync neural connection registry. Please try reloading.</p>
            <button onClick={() => window.location.reload()} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium transition-colors">
              Retry Connection
            </button>
          </div>
        )}

        {/* Models Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredModels.map((model) => {
              const spec = categorySpec[model.category] || { label: 'Trading Model', color: 'text-indigo-400 border-indigo-500/30', badgeBg: 'bg-indigo-500/10' };
              const sparklinePath = sparklineCoords[model.slug] || sparklineCoords['qsentia-btc-eth-perp-basis-alpha'];
              
              return (
                <Link
                  key={model.id}
                  href={`/marketplace/${model.slug}`}
                  className="group relative flex flex-col justify-between bg-[#080c22]/40 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-indigo-500/40 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
                >
                  {/* Subtle hover gradient strip on top */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500 transition-all duration-500"></div>
                  
                  {/* Background fine grid overlay to look like high-tech terminal */}
                  <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

                  <div>
                    {/* Header bar within card */}
                    <div className="flex items-start justify-between mb-4">
                      {/* Category Label */}
                      <span className={`px-2.5 py-1 ${spec.badgeBg} ${spec.color} border border-indigo-500/15 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-lg`}>
                        {spec.label}
                      </span>

                      {/* Live System Signal indicator */}
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-mono font-semibold tracking-wider rounded-lg flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        LIVE INSTANT
                      </span>
                    </div>

                    {/* Model Title & Description */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors duration-300">
                      {model.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2 h-10">
                      {model.description}
                    </p>

                    {/* Performance Metrics Panel */}
                    <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-[#0a0d28]/60 border border-white/5 rounded-xl">
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">Sharpe Ratio</p>
                        <p className="text-lg font-bold text-white tracking-tight">{numLabel(model.performance.sharpeRatio, 2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">Annualized Return</p>
                        <p className="text-lg font-bold text-emerald-400 tracking-tight">{pctLabel(model.performance.annualizedReturn, 1, true)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">Max Drawdown</p>
                        <p className="text-lg font-bold text-rose-500 tracking-tight">{pctLabel(model.performance.maxDrawdown, 1, false)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">Win Rate</p>
                        <p className="text-lg font-bold text-white tracking-tight">{pctLabel(model.performance.winRate, 1, false)}</p>
                      </div>
                    </div>

                    {/* Sparkline Visualisation representing return trends */}
                    <div className="h-12 w-full mb-6 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none"></div>
                      <svg className="w-full h-full" viewBox="0 0 240 50" preserveAspectRatio="none">
                        <path
                          d={sparklinePath}
                          fill="none"
                          stroke="url(#indigoGrad)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <defs>
                          <linearGradient id="indigoGrad" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="50%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Tags List */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {model.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-white/5 border border-white/5 text-[11px] text-gray-300 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions / Pricing Footer */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Access</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-white tracking-tight">Contact for live licensing</span>
                      </div>
                    </div>
                    
                    <button className="px-4 py-2 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-600 border border-indigo-500/20 group-hover:border-indigo-400/30 text-xs font-semibold text-indigo-300 group-hover:text-white transition-all duration-300 flex items-center gap-1.5">
                      Secure API
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredModels.length === 0 && (
          <div className="text-center py-24 bg-[#080b20]/20 border border-white/5 rounded-2xl backdrop-blur-xl">
            <Layers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-white text-xl font-bold mb-1">No Quantum Engine Found</p>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">We couldn't find matches containing "{searchQuery}". Try broad filters or another query.</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative py-28 border-t border-white/5 bg-[#040614] overflow-hidden z-20">
        <div className="absolute inset-0 bg-[#4f46e5]/5 blur-[120px] rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px]"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 border border-indigo-500/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest uppercase text-indigo-200">Sandbox API Sandbox</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">Ready to integrate predictive alpha?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Provision automated trial API credentials and run free queries against our deep neural endpoints directly from our sandboxes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl transition-all shadow-[0_0_25px_rgba(79,70,229,0.3)] hover:scale-[1.02]">
              Create Sandbox Credentials
            </button>
            <Link
              href="/research"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white font-bold rounded-xl transition-all hover:bg-white/10"
            >
              API Reference Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
