export type QsentiaUserSession = {
  name: string;
  email?: string;
  organization?: string;
  signedInAt: string;
};

export const QSENTIA_SESSION_KEY = 'qsentia_user_session';
export const QSENTIA_PROFILE_KEY = 'qsentia_user_profile';
export const QSENTIA_SESSION_EVENT = 'qsentia:session';

export function parseStoredSession(value: string | null): QsentiaUserSession | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<QsentiaUserSession>;
    if (!parsed.name) return null;

    return {
      name: String(parsed.name),
      email: parsed.email ? String(parsed.email) : undefined,
      organization: parsed.organization ? String(parsed.organization) : undefined,
      signedInAt: parsed.signedInAt ? String(parsed.signedInAt) : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function getStoredSession() {
  if (typeof window === 'undefined') return null;
  return parseStoredSession(window.localStorage.getItem(QSENTIA_SESSION_KEY));
}

export function getStoredProfile() {
  if (typeof window === 'undefined') return null;
  return parseStoredSession(window.localStorage.getItem(QSENTIA_PROFILE_KEY));
}

export function saveStoredSession(session: Omit<QsentiaUserSession, 'signedInAt'>) {
  if (typeof window === 'undefined') return;

  const nextSession: QsentiaUserSession = {
    ...session,
    signedInAt: new Date().toISOString(),
  };

  window.localStorage.setItem(QSENTIA_SESSION_KEY, JSON.stringify(nextSession));
  window.dispatchEvent(new CustomEvent(QSENTIA_SESSION_EVENT, { detail: nextSession }));
}

export function saveStoredProfile(profile: Omit<QsentiaUserSession, 'signedInAt'>) {
  if (typeof window === 'undefined') return;

  const nextProfile: QsentiaUserSession = {
    ...profile,
    signedInAt: new Date().toISOString(),
  };

  window.localStorage.setItem(QSENTIA_PROFILE_KEY, JSON.stringify(nextProfile));
  saveStoredSession(profile);
}

export function nameFromEmail(email: string) {
  const local = email.split('@')[0] || 'User';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
