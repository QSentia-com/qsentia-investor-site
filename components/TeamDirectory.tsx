"use client";

import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  FlaskConical,
  Mail,
  X,
} from "lucide-react";
import { SectionCard } from "@/components/PageChrome";

type Department = "Executive" | "Quantitative Research" | "Software Development";

type TeamMember = {
  fullName: string;
  designation: string;
  department: Department;
  initials: string;
  shortBio: string;
  yearsOfExperience: string;
  areasOfExpertise: string;
  educationalBackground: string;
  emailAddress: string;
  formalPhotograph: string;
};

const pending = "Pending publication";

const leadershipAndResearch: TeamMember[] = [
  {
    fullName: "Lucas Zarzeczny",
    designation: "CEO",
    department: "Executive",
    initials: "LZ",
    shortBio: pending,
    yearsOfExperience: pending,
    areasOfExpertise: pending,
    educationalBackground: pending,
    emailAddress: pending,
    formalPhotograph: pending,
  },
  {
    fullName: "Anikesh Bhuvaneshwaram",
    designation: "Quantitative Researcher",
    department: "Quantitative Research",
    initials: "AB",
    shortBio: pending,
    yearsOfExperience: pending,
    areasOfExpertise: pending,
    educationalBackground: pending,
    emailAddress: pending,
    formalPhotograph: pending,
  },
  {
    fullName: "Spencer Ozgur",
    designation: "Quantitative Researcher",
    department: "Quantitative Research",
    initials: "SO",
    shortBio: pending,
    yearsOfExperience: pending,
    areasOfExpertise: pending,
    educationalBackground: pending,
    emailAddress: pending,
    formalPhotograph: pending,
  },
];

const leftEngineering: TeamMember[] = [
  {
    fullName: "Debashish Mishra",
    designation: "Software Development",
    department: "Software Development",
    initials: "DM",
    shortBio: pending,
    yearsOfExperience: pending,
    areasOfExpertise: pending,
    educationalBackground: pending,
    emailAddress: pending,
    formalPhotograph: pending,
  },
  {
    fullName: "Shlok",
    designation: "Software Development",
    department: "Software Development",
    initials: "SH",
    shortBio: pending,
    yearsOfExperience: pending,
    areasOfExpertise: pending,
    educationalBackground: pending,
    emailAddress: pending,
    formalPhotograph: pending,
  },
];

const rightEngineering: TeamMember[] = [
  {
    fullName: "Ashutosh",
    designation: "Software Development",
    department: "Software Development",
    initials: "AS",
    shortBio: pending,
    yearsOfExperience: pending,
    areasOfExpertise: pending,
    educationalBackground: pending,
    emailAddress: pending,
    formalPhotograph: pending,
  },
  {
    fullName: "Deepanshu Yadav",
    designation: "Software Development",
    department: "Software Development",
    initials: "DY",
    shortBio: pending,
    yearsOfExperience: pending,
    areasOfExpertise: pending,
    educationalBackground: pending,
    emailAddress: pending,
    formalPhotograph: pending,
  },
];

const departmentStyle: Record<
  Department,
  { icon: typeof BriefcaseBusiness; badge: string; avatar: string }
> = {
  Executive: {
    icon: BriefcaseBusiness,
    badge: "border-[#c7d2fe] bg-[#eef2ff] text-[#3046c8]",
    avatar: "bg-[#172554] text-white",
  },
  "Quantitative Research": {
    icon: FlaskConical,
    badge: "border-[#bfece8] bg-[#effdfa] text-[#0f766e]",
    avatar: "bg-[#0f766e] text-white",
  },
  "Software Development": {
    icon: Code2,
    badge: "border-[#dbe3ff] bg-[#f8faff] text-[#3046c8]",
    avatar: "bg-[#3046c8] text-white",
  },
};

export default function TeamDirectory() {
  const [selected, setSelected] = useState<TeamMember | null>(null);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionCard className="overflow-hidden">
          <DirectoryHeader
            eyebrow="Leadership and research"
            title="Leadership and our quantitative researchers"
          />
          <div className="grid gap-px bg-[#e2e7fb] lg:grid-cols-3">
            {leadershipAndResearch.map((member) => (
              <ProfessionalProfileCard
                key={member.fullName}
                member={member}
                priority
                onOpen={() => setSelected(member)}
              />
            ))}
          </div>
        </SectionCard>

        <section className="mt-10" aria-labelledby="engineering-team-heading">
          <div className="flex flex-col gap-3 border-b border-[#e2e7fb] pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">
                Engineering
              </p>
              <h2
                id="engineering-team-heading"
                className="mt-2 text-2xl font-semibold text-[#06130c]"
              >
                Software development team
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <EngineeringColumn
              members={leftEngineering}
              onOpen={setSelected}
            />
            <EngineeringColumn
              members={rightEngineering}
              alignRight
              onOpen={setSelected}
            />
          </div>
        </section>
      </section>

      {selected ? (
        <TeamProfileDialog
          member={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}

function DirectoryHeader({
  body,
  eyebrow,
  title,
}: {
  body?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="border-b border-[#e2e7fb] px-6 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">
        {eyebrow}
      </p>
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="max-w-2xl text-2xl font-semibold text-[#06130c]">
          {title}
        </h2>
        {body ? (
          <p className="max-w-xl text-sm leading-6 text-[#5a685f]">{body}</p>
        ) : null}
      </div>
    </div>
  );
}

function EngineeringColumn({
  alignRight,
  members,
  onOpen,
}: {
  alignRight?: boolean;
  members: TeamMember[];
  onOpen: (member: TeamMember) => void;
}) {
  return (
    <div className={alignRight ? "lg:justify-self-end lg:w-full" : ""}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {members.map((member) => (
          <ProfessionalProfileCard
            key={member.fullName}
            member={member}
            onOpen={() => onOpen(member)}
          />
        ))}
      </div>
    </div>
  );
}

function ProfessionalProfileCard({
  member,
  onOpen,
  priority = false,
}: {
  member: TeamMember;
  onOpen: () => void;
  priority?: boolean;
}) {
  const style = departmentStyle[member.department];
  const Icon = style.icon;

  return (
    <article className="flex min-h-full flex-col bg-white p-6 transition hover:bg-[#fbfcff]">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${style.avatar}`}
          aria-label={`Formal photograph for ${member.fullName}: ${member.formalPhotograph}`}
        >
          {member.initials}
        </div>
        <div className="min-w-0">
          <h3
            className={
              priority
                ? "text-xl font-semibold text-[#06130c]"
                : "text-lg font-semibold text-[#06130c]"
            }
          >
            {member.fullName}
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#3046c8]">
            {member.designation}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${style.badge}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {member.department}
        </span>
        <span className="rounded-md border border-[#e2e7fb] bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#647269]">
          Photo pending
        </span>
      </div>

      <dl className="mt-5 grid gap-3 border-t border-[#edf1fb] pt-5">
        <ProfileLine label="Experience" value={member.yearsOfExperience} />
        <ProfileLine label="Expertise" value={member.areasOfExpertise} />
        <ProfileLine label="Education" value={member.educationalBackground} />
      </dl>

      <button
        type="button"
        onClick={onOpen}
        className="mt-auto inline-flex items-center gap-2 self-start pt-6 text-sm font-semibold text-[#3046c8] transition hover:text-[#172554]"
      >
        Read profile
        <ArrowRight className="h-4 w-4" />
      </button>
    </article>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-[11px] font-bold uppercase tracking-wide text-[#647269]">
        {label}
      </dt>
      <dd className="text-sm font-medium text-[#06130c]">{value}</dd>
    </div>
  );
}

function TeamProfileDialog({
  member,
  onClose,
}: {
  member: TeamMember;
  onClose: () => void;
}) {
  const style = departmentStyle[member.department];
  const Icon = style.icon;
  const profileFields = [
    ["Full Name", member.fullName],
    ["Designation / Role", member.designation],
    ["Department", member.department],
    ["Short Professional Bio", member.shortBio],
    ["Years of Experience", member.yearsOfExperience],
    ["Areas of Expertise", member.areasOfExpertise],
    ["Educational Background", member.educationalBackground],
    ["Email Address", member.emailAddress],
    ["Formal Photograph", member.formalPhotograph],
  ];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#050714]/60 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-profile-title"
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[12px] border border-[#dbe3ff] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-center justify-between border-b border-[#e2e7fb] px-6 py-5">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-md ${style.avatar}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">
              Team profile
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#dbe3ff] text-[#46554b] transition hover:border-[#3d52da] hover:text-[#172554]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid max-h-[calc(90vh-82px)] gap-6 overflow-y-auto p-6 lg:grid-cols-[220px_1fr]">
          <div className="rounded-[10px] border border-dashed border-[#cbd5ff] bg-[#f8faff] p-5">
            <div className="flex min-h-[190px] items-center justify-center rounded-md bg-white">
              <div className="text-center">
                <div
                  className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-semibold ${style.avatar}`}
                >
                  {member.initials}
                </div>
                <div className="mt-4 text-xs font-bold uppercase tracking-wide text-[#647269]">
                  Formal photograph
                </div>
                <div className="mt-1 text-sm font-semibold text-[#06130c]">
                  {member.formalPhotograph}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2
              id="team-profile-title"
              className="text-2xl font-semibold text-[#06130c]"
            >
              {member.fullName}
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#3046c8]">
              {member.designation}
            </p>
            <span
              className={`mt-4 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${style.badge}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {member.department}
            </span>

            <dl className="mt-6 grid gap-px overflow-hidden rounded-[10px] border border-[#e2e7fb] bg-[#e2e7fb] sm:grid-cols-2">
              {profileFields.map(([label, value]) => (
                <div key={label} className="bg-white p-4">
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-[#647269]">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm font-semibold leading-6 text-[#06130c]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {member.emailAddress === pending ? null : (
              <a
                href={`mailto:${member.emailAddress}`}
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#172554] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2437b5]"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
