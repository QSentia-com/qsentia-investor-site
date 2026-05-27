'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import { TrendingUp, Zap, Shield, Search, Filter } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Model = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  performance: {
    sharpeRatio: number;
    annualizedReturn: number;
    maxDrawdown: number;
    winRate: number;
  };
  pricing: {
    starter: number;
    pro: number;
    enterprise: number;
  };
  tags: string[];
};

export default function MarketplacePage() {
  const { data, error, isLoading } = useSWR('/api/models', fetcher);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const models: Model[] = data?.models || [];
  const categories = ['all', 'momentum', 'sentiment', 'macro', 'alternative-data', 'options'];

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      <QSentiaMotionBackground />

      {/* Header */}
      <header className="border-b border-[var(--bdr)] bg-[var(--sur)]/60 backdrop-blur-md sticky top-0 z-50">
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
            <Link href="/marketplace" className="text-[var(--t1)] font-medium">
              Marketplace
            </Link>
            <Link href="/dashboard" className="text-[var(--t2)] hover:text-[var(--t1)] transition-colors">
              Dashboard
            </Link>
            <Link href="/research" className="text-[var(--t2)] hover:text-[var(--t1)] transition-colors">
              Research
            </Link>
            <button className="px-5 py-2.5 bg-[var(--ac)] text-white rounded-lg hover:bg-[var(--ac)]/90 transition-all font-medium shadow-sm">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--acb)] rounded-full mb-6">
            <Zap className="w-4 h-4 text-[var(--ac)]" />
            <span className="text-sm font-medium text-[var(--ac)]">68ms average response time</span>
          </div>
          <h1 className="text-6xl font-bold text-[var(--t1)] mb-6 tracking-tight">
            AI Trading Models Marketplace
          </h1>
          <p className="text-xl text-[var(--t2)] max-w-3xl mx-auto leading-relaxed">
            Browse institutional-grade AI models for trading. No setup, no infrastructure—just API access to
            production-ready signals in under 68ms.
          </p>
          
          {/* Key Features */}
          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--gr)]" />
              <span className="text-sm font-medium text-[var(--t2)]">Real-time signals</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--ac)]" />
              <span className="text-sm font-medium text-[var(--t2)]">Battle-tested models</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--am)]" />
              <span className="text-sm font-medium text-[var(--t2)]">Instant API access</span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--t3)]" />
            <input
              type="text"
              placeholder="Search models by name, category, or strategy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[var(--sur)] border border-[var(--bdr)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ac)] focus:border-transparent transition-all text-[var(--t1)] placeholder:text-[var(--t3)]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--t3)]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-12 pr-8 py-3.5 bg-[var(--sur)] border border-[var(--bdr)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ac)] transition-all text-[var(--t1)] min-w-[200px] appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[var(--sur)] backdrop-blur-sm rounded-2xl border border-[var(--bdr)] p-6 animate-pulse">
                <div className="h-6 bg-[var(--bg)] rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-[var(--bg)] rounded w-full mb-2"></div>
                <div className="h-4 bg-[var(--bg)] rounded w-5/6"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-[var(--rdb)] border border-[var(--rd)]/20 rounded-2xl p-8 text-center backdrop-blur-sm">
            <p className="text-[var(--rd)] font-medium">Failed to load models. Please try again.</p>
          </div>
        )}

        {/* Models Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <Link
                key={model.id}
                href={`/marketplace/${model.slug}`}
                className="group bg-[var(--sur)] backdrop-blur-sm rounded-2xl border border-[var(--bdr)] p-7 hover:border-[var(--ac)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--t1)] group-hover:text-[var(--ac)] transition-colors">
                      {model.name}
                    </h3>
                    <p className="text-sm text-[var(--t3)] capitalize flex items-center gap-2 mt-1">
                      <TrendingUp className="w-4 h-4" />
                      {model.category.replace('-', ' ')}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 bg-[var(--grb)] text-[var(--gr)] text-xs font-semibold rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--gr)] rounded-full animate-pulse"></span>
                    Active
                  </span>
                </div>

                <p className="text-[var(--t2)] text-sm mb-6 line-clamp-2 leading-relaxed">{model.description}</p>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[var(--bg)]/50 rounded-xl">
                  <div className="p-2">
                    <p className="text-xs text-[var(--t3)] mb-1.5 font-medium">Sharpe Ratio</p>
                    <p className="text-lg font-bold text-[var(--t1)]">{model.performance.sharpeRatio.toFixed(2)}</p>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-[var(--t3)] mb-1.5 font-medium">Annual Return</p>
                    <p className="text-lg font-bold text-[var(--gr)]">
                      {model.performance.annualizedReturn > 0 ? '+' : ''}
                      {model.performance.annualizedReturn.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-[var(--t3)] mb-1.5 font-medium">Max Drawdown</p>
                    <p className="text-lg font-bold text-[var(--rd)]">{model.performance.maxDrawdown.toFixed(1)}%</p>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-[var(--t3)] mb-1.5 font-medium">Win Rate</p>
                    <p className="text-lg font-bold text-[var(--t1)]">{model.performance.winRate.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {model.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-[var(--acb)] text-[var(--ac)] text-xs font-medium rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Pricing */}
                <div className="pt-5 border-t border-[var(--bdr)]">
                  <p className="text-xs text-[var(--t3)] mb-2 font-medium uppercase tracking-wide">Starting at</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-[var(--t1)]">${model.pricing.starter}</p>
                    <span className="text-sm font-medium text-[var(--t3)]">/month</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredModels.length === 0 && (
          <div className="text-center py-20 bg-[var(--sur)] backdrop-blur-sm rounded-2xl border border-[var(--bdr)]">
            <p className="text-[var(--t2)] text-lg mb-2">No models found matching your criteria.</p>
            <p className="text-[var(--t3)] text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative py-24 mt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ac)] via-[var(--pu)] to-[var(--ac)] opacity-95"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Try before you buy</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Sign up now and get free demo calls to test any model before subscribing. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-4 bg-white text-[var(--ac)] font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105">
              Create Free Account
            </button>
            <Link
              href="/research"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
