'use client';

import { usePathname } from 'next/navigation';
import AlexAssistant from '@/components/AlexAssistant';
import CookieConsent from '@/components/CookieConsent';
import SiteFooter from '@/components/SiteFooter';

export default function PublicChrome() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <SiteFooter />
      <AlexAssistant />
      <CookieConsent />
    </>
  );
}
