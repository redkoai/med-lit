import { Image } from 'react-native';

/** Use the Expo app icon, never a look-alike glyph, for the product identity. */
export function BrandMark({ size = 34 }: { size?: number }) {
  return <Image
    source={require('../../assets/icon.png')}
    style={{ width: size, height: size, flexShrink: 0, borderRadius: size * 0.24 }}
    resizeMode="contain"
    testID="medlit-brand-mark"
    accessible={false}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    aria-hidden
  />;
}
