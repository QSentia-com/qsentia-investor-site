'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function PageLoadBuffer() {
  const pathname = usePathname();

  return <PathLoadBuffer key={pathname} />;
}

function PathLoadBuffer() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let done = false;
    const startedAt = Date.now();

    function finish() {
      if (done) return;
      done = true;
      const elapsed = Date.now() - startedAt;
      const delay = Math.max(240, 760 - elapsed);
      window.setTimeout(() => setVisible(false), delay);
    }

    if (document.readyState === 'complete') {
      window.setTimeout(finish, 140);
    } else {
      window.addEventListener('load', finish, { once: true });
    }

    const maxTimer = window.setTimeout(finish, 1400);

    return () => {
      done = true;
      window.clearTimeout(maxTimer);
      window.removeEventListener('load', finish);
    };
  }, []);

  if (!visible) return null;
  return <LoadingScreen fixed />;
}
