import React from "react";
import { View as RNView, StyleSheet, ViewProps } from "react-native";
import { useLanguage } from "../hooks/useLanguage";

interface RTLViewProps extends ViewProps {
  rtl?: boolean; // Force RTL regardless of language
}

export default function RTLView({
  style,
  rtl,
  children,
  ...props
}: RTLViewProps) {
  const { isRTL } = useLanguage();
  const shouldUseRTL = rtl !== undefined ? rtl : isRTL;

  return (
    <RNView
      style={[styles.view, shouldUseRTL && styles.rtlView, style]}
      {...props}
    >
      {children}
    </RNView>
  );
}

const styles = StyleSheet.create({
  view: {
    alignItems: "flex-start",
  },
  rtlView: {
    alignItems: "flex-end",
  },
});

