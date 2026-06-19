'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, X } from 'lucide-react';

type ConsentChoices = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

type StoredConsent = {
  version: 1;
  updatedAt: string;
  choices: ConsentChoices;
};

const STORAGE_KEY = 'qsentia_cookie_consent_v1';
const CONSENT_EVENT = 'qsentia:consent-updated';
const OPEN_EVENT = 'qsentia:open-cookie-settings';

const essentialOnly: ConsentChoices = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

const allCategories: ConsentChoices = {
  necessary: true,
  preferences: true,
  analytics: true,
  marketing: true,
};

function readConsent(): StoredConsent | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as StoredConsent;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function persistConsent(choices: ConsentChoices) {
  const value: StoredConsent = {
    version: 1,
    updatedAt: new Date().toISOString(),
    choices,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  const summary = choices.analytics || choices.marketing || choices.preferences ? 'custom' : 'essential';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `qsentia_cookie_consent=${summary}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export default function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [choices, setChoices] = useState<ConsentChoices>(essentialOnly);

  useEffect(() => {
    const existing = readConsent();
    const timer = window.setTimeout(() => {
      if (existing) setChoices(existing.choices);
      setVisible(!existing);
      setReady(true);
    }, 0);

    const openSettings = () => {
      const current = readConsent();
      setChoices(current?.choices || essentialOnly);
      setManaging(true);
      setVisible(true);
    };

    window.addEventListener(OPEN_EVENT, openSettings);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(OPEN_EVENT, openSettings);
    };
  }, []);

  function save(nextChoices: ConsentChoices) {
    persistConsent(nextChoices);
    setChoices(nextChoices);
    setVisible(false);
    setManaging(false);
  }

  if (!ready || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-3 pb-3 sm:px-5 sm:pb-5" role="region" aria-label="Cookie consent">
      <div className="mx-auto max-w-5xl border border-[#cbd5ff] bg-white shadow-[0_18px_60px_rgba(15,31,22,0.22)]">
        {managing ? (
          <div role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title">
            <div className="flex items-start justify-between gap-4 border-b border-[#e2e7fb] px-5 py-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#3046c8]">
                  <ShieldCheck className="h-4 w-4" /> Privacy controls
                </div>
                <h2 id="cookie-settings-title" className="mt-2 text-xl font-semibold text-[#06130c]">Cookie preferences</h2>
              </div>
              <button
                type="button"
                onClick={() => setManaging(false)}
                className="flex h-9 w-9 items-center justify-center border border-[#d6dded] text-[#46554b] hover:border-[#3d52da]"
                aria-label="Close cookie preferences"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 px-5 py-5 sm:grid-cols-2">
              <ConsentOption
                title="Necessary"
                body="Authentication, security, consent storage, and core site operation."
                checked
                disabled
                onChange={() => undefined}
              />
              <ConsentOption
                title="Preferences"
                body="Remembers optional interface choices and non-essential settings."
                checked={choices.preferences}
                onChange={(checked) => setChoices((current) => ({ ...current, preferences: checked }))}
              />
              <ConsentOption
                title="Analytics"
                body="Measures site usage when an analytics service is configured."
                checked={choices.analytics}
                onChange={(checked) => setChoices((current) => ({ ...current, analytics: checked }))}
              />
              <ConsentOption
                title="Marketing"
                body="Supports advertising or campaign measurement if introduced later."
                checked={choices.marketing}
                onChange={(checked) => setChoices((current) => ({ ...current, marketing: checked }))}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#e2e7fb] px-5 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => save(essentialOnly)} className="border border-[#cbd5ff] px-4 py-2.5 text-sm font-semibold text-[#172554] hover:border-[#3d52da]">
                Reject non-essential
              </button>
              <button type="button" onClick={() => save(choices)} className="bg-[#172554] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2437b5]">
                Save preferences
              </button>
              <button type="button" onClick={() => save(allCategories)} className="border border-[#3d52da] px-4 py-2.5 text-sm font-semibold text-[#3046c8] hover:bg-[#eef2ff]">
                Accept all
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-2xl gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#eef2ff] text-[#3d52da]">
                <Cookie className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-[#06130c]">Your privacy choices</h2>
                <p className="mt-1 text-sm leading-6 text-[#5a685f]">
                  QSentia uses necessary cookies for authentication, security, and consent storage. Optional categories remain off unless you allow them. Read the <Link href="/cookie-policy" className="font-semibold text-[#3046c8] hover:underline">Cookie Policy</Link>.
                </p>
              </div>
            </div>
            <div className="grid shrink-0 gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => save(essentialOnly)} className="border border-[#cbd5ff] px-4 py-2.5 text-sm font-semibold text-[#172554] hover:border-[#3d52da]">
                Reject optional
              </button>
              <button type="button" onClick={() => setManaging(true)} className="border border-[#cbd5ff] px-4 py-2.5 text-sm font-semibold text-[#172554] hover:border-[#3d52da]">
                Manage
              </button>
              <button type="button" onClick={() => save(allCategories)} className="bg-[#172554] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2437b5]">
                Accept all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsentOption({
  title,
  body,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  body: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border border-[#e2e7fb] bg-[#fbfcff] p-4">
      <span>
        <span className="block text-sm font-semibold text-[#06130c]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#647269]">{body}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-[#3d52da]"
      />
    </label>
  );
}
