import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type ViewProps,
} from "react-native";
export type MotionPressProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
};
export function MotionPress(props: MotionPressProps) {
  return (
    <Pressable {...props} dataSet={{ ...props.dataSet, motion: "press" }} />
  );
}
export function MotionReveal(props: ViewProps) {
  return <View {...props} dataSet={{ ...props.dataSet, motion: "finding" }} />;
}
