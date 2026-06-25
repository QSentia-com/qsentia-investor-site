'use client';

export default function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={() => window.dispatchEvent(new Event('qsentia:open-cookie-settings'))}
      className={className}
    >
      Cookie settings
    </button>
  );
}
