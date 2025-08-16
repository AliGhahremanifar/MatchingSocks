import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { useTranslation } from "react-i18next";
import { HapticTab } from "../../components/HapticTab";
import { IconSymbol } from "../../components/ui/IconSymbol";
import TabBarBackground from "../../components/ui/TabBarBackground";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useLanguage } from "../../hooks/useLanguage";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <Tabs
      key="main-tabs"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: false,
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: {
          fontFamily: "Vazir-Medium",
          fontSize: 12,
        },
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 88,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderTopWidth: 0.5,
            borderTopColor: "#E5E5EA",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          default: {
            height: 88,
            backgroundColor: "#fff",
            borderTopWidth: 0.5,
            borderTopColor: "#E5E5EA",
            elevation: 8,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home.title"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("history.title"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="history.fill" color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings.title"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
          href: null,
        }}
      />
    </Tabs>
  );
}
