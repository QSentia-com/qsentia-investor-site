import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight, FileCheck2, Mail, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/PageChrome';

export type PolicySection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  content?: ReactNode;
};

type Reference = {
  label: string;
  href: string;
};

export default function PolicyDocument({
  title,
  eyebrow,
  summary,
  effectiveDate,
  version,
  sections,
  notice,
  references = [],
}: {
  title: string;
  eyebrow: string;
  summary: string;
  effectiveDate: string;
  version: string;
  sections: readonly PolicySection[];
  notice?: string;
  references?: readonly Reference[];
}) {
  return (
    <PageShell>
      <section className="border-b border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#3046c8]">
            <FileCheck2 className="h-4 w-4" />
            {eyebrow}
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] text-[#06130c] md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#46554b]">{summary}</p>
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#5a685f]">
            <span><strong className="text-[#06130c]">Effective:</strong> {effectiveDate}</span>
            <span><strong className="text-[#06130c]">Version:</strong> {version}</span>
            <span><strong className="text-[#06130c]">Owner:</strong> QSentia</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:py-14">
        <aside className="self-start lg:sticky lg:top-24">
          <div className="border-l-2 border-[#cbd5ff] pl-4">
            <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Contents</div>
            <nav className="mt-4 grid gap-2" aria-label={`${title} contents`}>
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-sm leading-6 text-[#46554b] transition hover:text-[#2b36ff]"
                >
                  {index + 1}. {section.title}
                </a>
              ))}
            </nav>
          </div>

          <div className="mt-8 border-t border-[#e2e7fb] pt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#06130c]">
              <Mail className="h-4 w-4 text-[#2b36ff]" />
              Privacy and grievance contact
            </div>
            <a
              href="mailto:inquiries@qsentia.com?subject=Privacy%20or%20Compliance%20Request"
              className="mt-2 block break-all text-sm text-[#3046c8] hover:underline"
            >
              inquiries@qsentia.com
            </a>
            <Link href="/contact" className="mt-2 inline-block text-sm font-semibold text-[#3046c8] hover:underline">
              Contact form
            </Link>
          </div>
        </aside>

        <article className="min-w-0">
          {notice ? (
            <div className="mb-8 flex gap-3 border border-[#cbd5ff] bg-[#f8faff] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2b36ff]" />
              <p className="text-sm leading-6 text-[#46554b]">{notice}</p>
            </div>
          ) : null}

          <div className="divide-y divide-[#e2e7fb] border-y border-[#e2e7fb]">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 py-8 first:pt-0 last:pb-0">
                <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Section {index + 1}</div>
                <h2 className="mt-2 text-2xl font-semibold text-[#06130c]">{section.title}</h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-[#5a685f]">{paragraph}</p>
                  ))}
                  {section.bullets?.length ? (
                    <ul className="grid gap-2 pl-5 text-sm leading-7 text-[#5a685f]">
                      {section.bullets.map((bullet) => <li key={bullet} className="list-disc">{bullet}</li>)}
                    </ul>
                  ) : null}
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {references.length ? (
            <section className="mt-10 border-t border-[#e2e7fb] pt-7">
              <h2 className="text-lg font-semibold text-[#06130c]">Official references</h2>
              <div className="mt-4 grid gap-2">
                {references.map((reference) => (
                  <a
                    key={reference.href}
                    href={reference.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#3046c8] hover:underline"
                  >
                    {reference.label}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </section>
    </PageShell>
  );
}
