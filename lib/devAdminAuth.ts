export const DEV_ADMIN_COOKIE = 'qsentia_dev_admin';

const DEV_ADMIN_SESSION = 'qsentia-local-admin';

export function devAdminEnabled() {
  return process.env.QSENTIA_ENABLE_DEV_ADMIN === '1' || process.env.NODE_ENV !== 'production';
}

export function devAdminPassword() {
  return process.env.QSENTIA_DEV_ADMIN_PASSWORD || 'luke123456';
}

export function validDevAdminSession(value?: string | null) {
  return devAdminEnabled() && value === DEV_ADMIN_SESSION;
}

export function devAdminSessionValue() {
  return DEV_ADMIN_SESSION;
}
