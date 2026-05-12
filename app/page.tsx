'use client';

import Image from 'next/image';
import Link from 'next/link';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#fbfbfb] text-black">
      <QSentiaMotionBackground />

      {/* Fixed Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/70 shadow-lg backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo/Qsentia Logo Bg transparent.png" 
              alt="QSentia Logo" 
              width={350} 
              height={90}
              className="h-24 w-auto"
              priority
            />
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/dashboard" className="text-sm font-medium text-gray-700 transition-colors hover:text-[#4b3fd1]">
              Dashboard
            </Link>
            <a href="mailto:Lucas.Zarzeczny@qsentia.com" className="text-sm font-medium text-gray-700 transition-colors hover:text-[#4b3fd1]">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center pt-20">
        {/* Animated Grid Background */}
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-20" />

        {/* Decorative Elements */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#4b3fd1]/2 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-[#4b3fd1]/2 blur-3xl" />

        <div className="relative z-10 space-y-8 max-w-4xl animate-[slide-up_0.8s_ease-out]">
          {/* Headline with Gradient Text */}
          <h1 className="gradient-text text-[clamp(56px,12vw,88px)] font-light leading-[1] tracking-tighter drop-shadow-lg">
            More Alpha
            <br />
            Less Risk
          </h1>

          {/* Glowing Divider */}
          <div className="divider-glow mx-auto h-px w-32" />

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-lg leading-8 text-neutral-600 md:text-xl animate-[slide-up_0.8s_ease-out_0.15s_backwards]">
            Where intelligent reinforcement learning meets market perception.
          </p>

          {/* CTA Buttons - Stacked with Visual Hierarchy */}
          <div className="flex flex-col items-center gap-4 pt-8 md:flex-row md:justify-center animate-[slide-up_0.8s_ease-out_0.3s_backwards]">
            {/* Primary Button with Enhanced Animation */}
            <a
              href="/dashboard"
              className="glow-border relative w-full rounded-lg bg-[#4b3fd1] px-10 py-4 text-center font-semibold text-white shadow-[0_0_30px_rgba(75,63,209,0.4)] transition-all duration-300 md:w-auto hover:shadow-[0_0_60px_rgba(75,63,209,0.7)] hover:-translate-y-1 active:translate-y-0 group overflow-hidden"
            >
              <span className="relative z-10">View Live Research Terminal</span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>

            {/* Secondary Button */}
            <a
              href="mailto:Lucas.Zarzeczny@qsentia.com?subject=QSentia Investor Information Request"
              className="card-hover w-full rounded-lg border-2 border-black/20 bg-white/40 px-10 py-4 text-center font-semibold text-black backdrop-blur-md transition-all duration-300 md:w-auto hover:border-[#4b3fd1] hover:text-[#4b3fd1] hover:bg-white/60"
            >
              Request Information
            </a>
          </div>
        </div>

        {/* Pulsing Scroll Indicator */}
        <div className="pulse-arrow absolute bottom-8 text-4xl font-light text-neutral-500">⌄</div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative z-10 bg-gradient-to-b from-[#fbfbfb] to-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-16 space-y-4 text-center">
            <p className="text-sm font-semibold tracking-widest text-[#4b3fd1] uppercase">Investment Framework</p>
            <h2 className="text-3xl font-light tracking-tight text-black md:text-4xl">Our Investment Thesis</h2>
          </div>

          {/* Cards Grid: 2x2 on Desktop, Single Column on Mobile */}
          <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
            <ThesisCard
              number="01"
              title="Adaptive Allocation"
              text="BR-PPO dynamically shifts exposure based on live portfolio state, model signals, and risk behavior."
              delay="0ms"
            />
            <ThesisCard
              number="02"
              title="Benchmark Discipline"
              text="Every model is evaluated against transparent market benchmarks and normalized performance curves."
              delay="100ms"
            />
            <ThesisCard
              number="03"
              title="Risk First"
              text="Drawdown, volatility, hit rate, and model health are visible before capital allocation decisions."
              delay="200ms"
            />
            <ThesisCard
              number="04"
              title="Execution Transparency"
              text="Orders, positions, target weights, and decisions are logged and visible from the same source of truth."
              delay="300ms"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/10 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image 
                  src="/logo/Qsentia Logo Bg transparent.png" 
                  alt="QSentia Logo" 
                  width={340} 
                  height={80}
                  className="h-20 w-auto"
                />
              </div>
              <p className="text-sm text-gray-600">Intelligent reinforcement learning for quantitative finance.</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-black">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/dashboard" className="hover:text-[#4b3fd1] transition-colors">Dashboard</a></li>
                <li><a href="#thesis" className="hover:text-[#4b3fd1] transition-colors">Research</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-black">Contact</h4>
              <a href="mailto:Lucas.Zarzeczny@qsentia.com" className="text-sm text-gray-600 hover:text-[#4b3fd1] transition-colors">
                Lucas.Zarzeczny@qsentia.com
              </a>
            </div>
          </div>
          <div className="mt-12 border-t border-black/10 pt-8 text-center text-xs text-gray-600">
            <p>&copy; {new Date().getFullYear()} QSentia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ThesisCard({
  number,
  title,
  text,
  delay,
}: {
  number: string;
  title: string;
  text: string;
  delay: string;
}) {
  return (
    <div 
      className="card-entrance card-hover group relative overflow-hidden rounded-2xl border border-[#4b3fd1]/20 bg-white/50 p-8 backdrop-blur-md transition-all duration-300"
      style={{ animationDelay: delay }}
    >
      {/* Decorative background blur with enhanced animation */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#4b3fd1]/8 blur-3xl group-hover:bg-[#4b3fd1]/20 transition-all duration-500 float-animation" />

      {/* Left Border Accent with gradient */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#4b3fd1] via-[#4b3fd1]/50 to-transparent group-hover:w-1.5 transition-all duration-300" />

      {/* Decorative Number Background */}
      <div className="relative mb-8 overflow-hidden">
        <p className="text-8xl font-light text-[#4b3fd1]/8 leading-none group-hover:text-[#4b3fd1]/12 transition-colors duration-300">{number}</p>
      </div>

      {/* Content with enhanced spacing */}
      <div className="relative space-y-4">
        <p className="text-xs font-semibold tracking-widest text-[#4b3fd1] uppercase opacity-60 group-hover:opacity-100 transition-opacity duration-300">{number}</p>
        <h3 className="text-2xl font-light tracking-tight text-black group-hover:text-[#4b3fd1] transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm leading-6 text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{text}</p>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-[#4b3fd1]" />
    </div>
  );
}