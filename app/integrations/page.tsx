import type { Metadata } from "next";
import { CheckCircle2, Database, GitBranch, Waypoints } from "lucide-react";
import { PageIntro } from "@/components/InstitutionalShell";
import { PageShell, SectionCard } from "@/components/PageChrome";
export const metadata: Metadata = { title: "Integrations | QSentia" };
const connected = [
  [
    "GitHub model logs",
    "Repository registry and source-backed telemetry ingestion.",
    GitBranch,
  ],
  [
    "Supabase",
    "Authentication and production data persistence when configured.",
    Database,
  ],
  [
    "IBKR",
    "Broker/account fields are present in registered model telemetry.",
    Waypoints,
  ],
  [
    "Alpaca",
    "Registered strategies include Alpaca-routed model implementations.",
    Waypoints,
  ],
];
export default function IntegrationsPage() {
  return (
    <PageShell active="/integrations">
      <PageIntro
        eyebrow="Integrations"
        title="Connected where evidence exists"
        body="Integration status reflects this application’s current code and model registry. Planned connectors are never presented as live."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="lg:col-span-2 mx-auto w-full max-w-2xl">
          <h2 className="text-2xl font-semibold text-[#06130c]">
            Connected or represented
          </h2>
          <div className="mt-5 grid gap-4">
            {connected.map(([title, body, Icon]) => (
              <SectionCard key={String(title)} className="flex gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#06130c]">
                      {String(title)}
                    </h3>
                    <CheckCircle2 className="h-4 w-4 text-[#047857]" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#5a685f]">
                    {String(body)}
                  </p>
                </div>
              </SectionCard>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
