import { type ViewProps } from "react-native";

import { useThemeColor } from "../hooks/useThemeColor";
import RTLView from "./RTLView";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return <RTLView style={[{ backgroundColor }, style]} {...otherProps} />;
}
