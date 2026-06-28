import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { Eyebrow, PageShell, TechnicalBackdrop } from "@/components/PageChrome";
import { getTeamMember, teamMembers, type TeamRole } from "@/lib/team";

const roleStyles: Record<
  TeamRole,
  { badge: string; avatar: string; ring: string }
> = {
  CEO: {
    badge: "border-[#cbd5ff] bg-[#eef2ff] text-[#172554]",
    avatar: "bg-[#172554] text-white",
    ring: "border-[#cbd5ff]",
  },
  "Quantitative Research": {
    badge: "border-[#c7d2fe] bg-[#f8faff] text-[#3046c8]",
    avatar: "bg-[#3046c8] text-white",
    ring: "border-[#c7d2fe]",
  },
  "Software Development": {
    badge: "border-[#dbe3ff] bg-white text-[#23443a]",
    avatar: "bg-[#eef2ff] text-[#172554]",
    ring: "border-[#dbe3ff]",
  },
};

export function generateStaticParams() {
  return teamMembers.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getTeamMember(slug);

  if (!member) {
    return {
      title: "Team Bio | QSentia",
    };
  }

  return {
    title: `${member.fullName} | QSentia Team`,
    description: member.summary,
  };
}

export default async function TeamBioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = getTeamMember(slug);

  if (!member) notFound();

  const style = roleStyles[member.role];

  return (
    <PageShell active="/team">
      <section className="relative overflow-hidden border-b border-[#e2e7fb] bg-[#f8faff]">
        <TechnicalBackdrop />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:items-end lg:py-16">
          <div>
            <Link
              href="/team"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#172554] transition hover:text-[#3046c8]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to team
            </Link>
            <div className="mt-8">
              <Eyebrow>Team bio</Eyebrow>
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#06130c] md:text-7xl">
              {member.fullName}
            </h1>
            <p className="mt-5 text-lg font-semibold text-[#3046c8]">
              {member.designation}
            </p>
            <span
              className={`mt-5 inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${style.badge}`}
            >
              {member.role}
            </span>
          </div>

          <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-[14px] border border-[#dbe3ff] bg-white shadow-sm">
            {member.imageSrc ? (
              <Image
                src={member.imageSrc}
                alt={member.imageAlt ?? member.fullName}
                fill
                priority
                sizes="(min-width: 1024px) 320px, 100vw"
                className="object-cover"
                style={{ objectPosition: member.imagePosition ?? "center" }}
              />
            ) : (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(to_right,rgba(61,82,218,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(61,82,218,0.06)_1px,transparent_1px)] bg-[size:54px_54px]"
                />
                <div
                  className={`relative z-10 flex h-36 w-36 items-center justify-center rounded-full border-4 bg-white text-5xl font-semibold ${style.ring}`}
                >
                  <span className={`flex h-28 w-28 items-center justify-center rounded-full ${style.avatar}`}>
                    {member.initials}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="max-w-4xl">
          <div className="grid gap-7 text-xl leading-9 text-[#06130c]">
            {member.biography.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[12px] border border-[#e2e7fb] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">
              Profile highlights
            </p>

            {member.qualifications ? (
              <div className="mt-6 border-t border-[#e2e7fb] pt-5">
                <h2 className="text-sm font-semibold text-[#06130c]">
                  Qualifications
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#46554b]">
                  {member.qualifications}
                </p>
              </div>
            ) : null}

            {member.focus ? (
              <div className="mt-6 border-t border-[#e2e7fb] pt-5">
                <h2 className="text-sm font-semibold text-[#06130c]">Focus</h2>
                <p className="mt-2 text-sm leading-6 text-[#46554b]">
                  {member.focus}
                </p>
              </div>
            ) : null}

            {member.emailAddress ? (
              <div className="mt-6 border-t border-[#e2e7fb] pt-5">
                <h2 className="text-sm font-semibold text-[#06130c]">
                  Contact
                </h2>
                <a
                  href={`mailto:${member.emailAddress}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#172554] transition hover:text-[#3046c8]"
                >
                  <Mail className="h-4 w-4" />
                  {member.emailAddress}
                </a>
              </div>
            ) : null}
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
