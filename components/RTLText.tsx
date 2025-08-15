import React from "react";
import { Text as RNText, StyleSheet, TextProps } from "react-native";
import { useLanguage } from "../hooks/useLanguage";
import { getFontFamily } from "../utils/fonts";

interface RTLTextProps extends TextProps {
  weight?: "light" | "regular" | "medium" | "bold";
}

export default function RTLText({
  style,
  weight = "regular",
  children,
  ...props
}: RTLTextProps) {
  const { isRTL } = useLanguage();

  const fontFamily = getFontFamily(isRTL, weight);

  return (
    <RNText
      style={[styles.text, { fontFamily }, isRTL && styles.rtlText, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "left",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});

