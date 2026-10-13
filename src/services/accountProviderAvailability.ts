export interface AccountProviderConfig {
  googleEnabled?: string;
  appleEnabled?: string;
  googleWebClientId?: string;
  googleIosClientId?: string;
}
/** A working email account never implies OAuth is configured. */
export function accountProviderAvailability(
  cloudReady: boolean,
  platform: string,
  config: AccountProviderConfig,
) {
  return {
    google:
      cloudReady &&
      config.googleEnabled === "true" &&
      (platform === "web" ||
        Boolean(
          config.googleWebClientId &&
            (platform !== "ios" || config.googleIosClientId),
        )),
    apple:
      cloudReady &&
      config.appleEnabled === "true" &&
      (platform === "web" || platform === "ios"),
  };
}
export function configuredAccountProviders(
  cloudReady: boolean,
  platform: string,
) {
  return accountProviderAvailability(cloudReady, platform, {
    googleEnabled: process.env.EXPO_PUBLIC_ENABLE_GOOGLE_SIGN_IN,
    appleEnabled: process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
}
