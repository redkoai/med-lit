import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
/** Decorative glyphs must not become private-use Unicode screen-reader text. */
export function WorkspaceIcon(props: ComponentProps<typeof Ionicons>) {
  return <Ionicons {...props} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden />;
}
