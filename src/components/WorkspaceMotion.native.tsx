import { Pressable, type ViewProps } from "react-native";
import Animated, {
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { MotionPressProps } from "./WorkspaceMotion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
/** UI-thread feedback only; no looping or per-row entrance animations. */
export function MotionPress({
  style,
  onPressIn,
  onPressOut,
  ...props
}: MotionPressProps) {
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  const feedback = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      {...props}
      style={[style, feedback]}
      onPressIn={(event) => {
        scale.value = withTiming(reduce ? 1 : 0.98, {
          duration: 120,
          reduceMotion: ReduceMotion.System,
        });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, {
          duration: 120,
          reduceMotion: ReduceMotion.System,
        });
        onPressOut?.(event);
      }}
    />
  );
}
export function MotionReveal(props: ViewProps) {
  return (
    <Animated.View
      {...props}
      entering={FadeIn.duration(240).reduceMotion(ReduceMotion.System)}
    />
  );
}
