import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../i18n";

import { useColorScheme } from "../hooks/useColorScheme";
import { LanguageProvider } from "../hooks/useLanguage";
import { isFirstTime } from "../utils/storage";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Vazir: require("../assets/fonts/Vazir-FD-WOL.ttf"),
    "Vazir-Bold": require("../assets/fonts/Vazir-Bold-FD-WOL.ttf"),
    "Vazir-Light": require("../assets/fonts/Vazir-Light-FD-WOL.ttf"),
    "Vazir-Medium": require("../assets/fonts/Vazir-Medium-FD-WOL.ttf"),
    "Vazir-Thin": require("../assets/fonts/Vazir-Thin-FD-WOL.ttf"),
  });
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstTime = async () => {
      const firstTime = await isFirstTime();
      setIsFirstTimeUser(firstTime);
    };
    checkFirstTime();
  }, []);

  if (!loaded || isFirstTimeUser === null) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {isFirstTimeUser ? (
            <Stack.Screen
              name="onboarding"
              options={{
                headerShown: true,
                headerTitle: "Create Group",
                headerStyle: {
                  backgroundColor: "#fff",
                },
                headerTintColor: "#333",
                headerTitleStyle: {
                  fontFamily: "Vazir-Bold",
                },
              }}
            />
          ) : (
            <>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: true,
                  headerTitle: "Matching Socks",
                  headerStyle: {
                    backgroundColor: "#fff",
                  },
                  headerTintColor: "#333",
                  headerTitleStyle: {
                    fontFamily: "Vazir-Bold",
                  },
                }}
              />
              <Stack.Screen name="+not-found" />
            </>
          )}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </LanguageProvider>
  );
}
