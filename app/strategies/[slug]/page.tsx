import type { Metadata } from 'next';
import StrategyDetail from '@/components/StrategyDetail';
import { PageIntro } from '@/components/InstitutionalShell';
import { PageShell } from '@/components/PageChrome';
export const metadata: Metadata = { title:'Strategy Detail | QSentia' };
export default async function StrategyPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <PageShell active="/strategies"><PageIntro eyebrow="Strategy diligence" title="Strategy profile" body="A source-backed model card with explicit distinctions between reported facts and information still awaiting publication."/><section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><StrategyDetail slug={slug}/></section></PageShell>}
