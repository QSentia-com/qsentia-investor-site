import type { Metadata } from "next";
import { PageIntro } from "@/components/InstitutionalShell";
import { PageShell } from "@/components/PageChrome";
import TeamDirectory from "@/components/TeamDirectory";

export const metadata: Metadata = {
  title: "Team | QSentia",
  description:
    "The QSentia team building investor telemetry, model research workflows, and API infrastructure.",
};

export default function TeamPage() {
  return (
    <PageShell active="/team">
      <PageIntro
        eyebrow="Team"
        title="Meet the QSentia team"
        body="Meet the people building QSentia's investor telemetry, model research workflows, customer dashboards, and API infrastructure for systematic investment operations."
      />
      <TeamDirectory />
    </PageShell>
  );
}
