import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { teamMembers, type TeamMember, type TeamRole } from "@/lib/team";

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

export default function TeamDirectory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-10 grid gap-6 border-y border-[#e2e7fb] py-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">
            QSentia team
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-normal text-[#06130c]">
            People building the research and platform layer
          </h2>
        </div>
        <p className="max-w-3xl text-base leading-7 text-[#46554b]">
          QSentia brings together leadership, quantitative research, and
          software development to build model telemetry, investor diligence
          workflows, customer dashboards, and API infrastructure for systematic
          investment operations.
        </p>
      </div>

      <div className="grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
        {teamMembers.map((member) => (
          <TeamProfileCard key={member.slug} member={member} />
        ))}
      </div>
    </section>
  );
}

function TeamProfileCard({ member }: { member: TeamMember }) {
  const style = roleStyles[member.role];
  const cardPlacement = member.slug === "ashutosh" ? "xl:col-start-2" : "";

  return (
    <article
      className={`flex h-full min-h-[460px] flex-col overflow-hidden rounded-[12px] border border-[#e2e7fb] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#b8c5ff] hover:shadow-[0_18px_48px_rgba(23,37,84,0.12)] ${cardPlacement}`}
    >
      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-[#f8faff]">
        {member.imageSrc ? (
          <Image
            src={member.imageSrc}
            alt={member.imageAlt ?? member.fullName}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
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
              className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full border-4 bg-white text-3xl font-semibold ${style.ring}`}
            >
              <span className={`flex h-24 w-24 items-center justify-center rounded-full ${style.avatar}`}>
                {member.initials}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span
          className={`inline-flex self-start rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${style.badge}`}
        >
          {member.role}
        </span>

        <h3 className="mt-5 text-2xl font-semibold tracking-normal text-[#06130c]">
          {member.fullName}
        </h3>
        <p className="mt-1 text-sm font-semibold text-[#3046c8]">
          {member.designation}
        </p>
        <p className="mt-5 flex-1 text-sm leading-6 text-[#334139]">
          {member.summary}
        </p>

        <Link
          href={`/team/${member.slug}`}
          className="mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold text-[#172554] transition hover:text-[#3046c8]"
        >
          Read bio
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
