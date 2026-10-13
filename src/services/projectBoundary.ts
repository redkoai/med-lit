/** Fail closed unless an operator explicitly configures a MedLit cloud project.
 * Naming is a deployment guard, not proof of ownership or isolated cloud data.
 */
export interface MedLitCloudConfig {
  enabled?: string;
  dedicatedProjectId?: string;
  projectId?: string;
  apiKey?: string;
  authDomain?: string;
  appId?: string;
}

export function isDedicatedMedLitCloud(config: MedLitCloudConfig): boolean {
  return config.enabled === 'true'
    && Boolean(config.projectId && /^medlit-[a-z0-9-]+$/.test(config.projectId))
    && config.dedicatedProjectId === config.projectId
    && config.authDomain === `${config.projectId}.firebaseapp.com`
    && Boolean(config.apiKey?.trim() && config.appId?.trim());
}

export const MEDLIT_FIREBASE_APP_NAME = 'medlit-workspace';
