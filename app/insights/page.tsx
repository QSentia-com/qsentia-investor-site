import type { Metadata } from 'next';
import { PageIntro } from '@/components/InstitutionalShell';
import { EmptyState, PageShell } from '@/components/PageChrome';
export const metadata: Metadata = { title:'Research and Monthly Letters | QSentia' };
export default function InsightsPage(){return <PageShell active="/insights"><PageIntro eyebrow="Research" title="Monthly letters and market research" body="Firm-approved commentary, strategy notes, and methodology updates will be published here with authorship and publication dates."/><section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><EmptyState title="No public letters published" body="The publication registry is ready. QSentia will not backfill invented commentary or undated research."/></section></PageShell>}
