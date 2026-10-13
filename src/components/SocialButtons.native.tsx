import React, { useEffect, useState } from "react";
import { Platform, Text, TurboModuleRegistry, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
const GoogleSigninButton = TurboModuleRegistry.get("RNGoogleSignin") ? require("@react-native-google-signin/google-signin").GoogleSigninButton as typeof import("@react-native-google-signin/google-signin").GoogleSigninButton : null;
import type { SocialButtonsProps } from "./SocialButtons";
export default function SocialButtons({
  busy,
  onGoogle,
  onApple,
  googleReady,
  appleReady,
}: SocialButtonsProps) {
  const [apple, setApple] = useState(false);
  useEffect(() => {
    let active = true;
    if (Platform.OS === "ios")
      void AppleAuthentication.isAvailableAsync()
        .then((available) => {
          if (active) setApple(available);
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <View style={{ gap: 12 }}>
      {GoogleSigninButton && <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        disabled={busy || !googleReady}
        onPress={onGoogle}
        style={{ width: "100%", height: 54 }}
      />}
      {apple && (
        <View
          pointerEvents={busy || !appleReady ? "none" : "auto"}
          accessibilityState={{ disabled: busy || !appleReady }}
          style={{ opacity: busy || !appleReady ? 0.5 : 1 }}
        >
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={10}
            style={{ width: "100%", height: 54 }}
            onPress={() => {
              if (!busy && appleReady) onApple();
            }}
          />
        </View>
      )}
      {(!googleReady || !GoogleSigninButton || (apple && !appleReady)) && (
        <Text style={{ color: "#58647B", fontSize: 14, lineHeight: 22 }}>
          Unavailable sign-in methods are not connected in this build. Guest
          reading is available.
        </Text>
      )}
    </View>
  );
}
