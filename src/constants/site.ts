// Keep the working public alias canonical until custom-domain ownership and TLS verify.
const PRODUCTION_ORIGIN = 'https://medlit-evidence-appraisal.vercel.app';
const configured = (process.env.EXPO_PUBLIC_SITE_URL || '').replace(/\/$/, '');

/** Canonical/public links must never inherit a localhost value from developer dotenv files. */
export const PUBLIC_SITE_URL = configured.startsWith('https://') ? configured : PRODUCTION_ORIGIN;
