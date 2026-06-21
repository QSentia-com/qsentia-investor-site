import type { Metadata } from 'next';
import SandboxDemo from '@/components/SandboxDemo';
import { PageIntro } from '@/components/InstitutionalShell';
import { PageShell } from '@/components/PageChrome';
export const metadata: Metadata = { title:'Platform Sandbox | QSentia' };
export default function DemoPage(){return <PageShell active="/demo"><PageIntro eyebrow="Synthetic sandbox" title="Explore the control workflow" body="Try model-monitoring states without an account. Every value on this page is intentionally synthetic and cannot be confused with live QSentia performance."/><section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><SandboxDemo/></section></PageShell>}
