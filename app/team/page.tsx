import type { Metadata } from "next";
import { PageIntro } from "@/components/InstitutionalShell";
import { PageShell } from "@/components/PageChrome";
import TeamDirectory from "@/components/TeamDirectory";

export const metadata: Metadata = {
  title: "Team | QSentia",
  description:
    "QSentia leadership, software development, and quantitative research team directory.",
};

export default function TeamPage() {
  return (
    <PageShell active="/team">
      <PageIntro
        eyebrow="Team"
        title="The people building QSentia"
        body="QSentia's public team directory lists approved roles for leadership, software development, and quantitative research. Photos and biographies will be added after publication review."
      />
      <TeamDirectory />
    </PageShell>
  );
}
