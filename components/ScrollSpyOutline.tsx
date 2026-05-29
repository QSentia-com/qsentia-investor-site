'use client';

import { useEffect, useMemo, useState } from 'react';

type OutlineItem = {
  id: string;
  label: string;
};

type ScrollSpyOutlineProps = {
  title?: string;
  items: OutlineItem[];
};

export default function ScrollSpyOutline({ title = 'On this page', items }: ScrollSpyOutlineProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '');

  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    if (!sectionIds.length) return;

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length) {
          setActiveId(visible[0].target.id);
          return;
        }

        const firstBelowViewport = sections.find((section) => section.getBoundingClientRect().top > 0);
        if (firstBelowViewport) {
          const index = sections.indexOf(firstBelowViewport);
          const previous = sections[Math.max(0, index - 1)];
          setActiveId(previous.id);
          return;
        }

        setActiveId(sections[sections.length - 1].id);
      },
      {
        rootMargin: '-22% 0px -62% 0px',
        threshold: [0, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sectionIds]);

  return (
    <div className="sticky top-24">
      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <nav className="mt-3 space-y-2 text-xs">
        {items.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={isActive ? 'location' : undefined}
              className={`flex items-center gap-2 border-l px-2 py-1.5 transition-all duration-200 ${
                isActive
                  ? 'border-indigo-400 text-indigo-200'
                  : 'border-transparent text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
            >
              <span className="w-6 shrink-0 font-mono text-[10px] text-slate-500">{index + 1}.</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
