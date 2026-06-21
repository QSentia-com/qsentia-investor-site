import type { Metadata } from 'next';
import PerformanceCenter from '@/components/PerformanceCenter';
import { PageIntro } from '@/components/InstitutionalShell';
import { PageShell } from '@/components/PageChrome';
export const metadata: Metadata = { title:'Performance Center | QSentia', description:'Source-backed strategy performance, benchmark, return, and drawdown analytics.' };
export default function PerformancePage(){return <PageShell active="/performance"><PageIntro eyebrow="Performance center" title="Performance, with the method visible" body="Evaluate normalized returns, monthly outcomes, rolling risk, drawdown, and benchmark context from live repository-backed observations."/><section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><PerformanceCenter/></section></PageShell>}
