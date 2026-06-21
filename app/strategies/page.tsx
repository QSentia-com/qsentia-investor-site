import type { Metadata } from 'next';
import StrategyDirectory from '@/components/StrategyDirectory';
import { PageIntro } from '@/components/InstitutionalShell';
import { PageShell } from '@/components/PageChrome';

export const metadata: Metadata = { title:'Investment Strategies | QSentia', description:'Published QSentia systematic strategies and source-backed performance fields.' };
export default function StrategiesPage(){return <PageShell active="/strategies"><PageIntro eyebrow="Investor lane" title="Investment strategies" body="Review each published strategy through its objective, instrument context, operating status, and currently reported performance evidence."/><section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><StrategyDirectory/></section></PageShell>}
