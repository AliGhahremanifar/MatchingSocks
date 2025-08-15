import * as Font from "expo-font";

export const loadFonts = async () => {
  await Font.loadAsync({
    Vazir: require("../assets/fonts/Vazir-FD-WOL.ttf"),
    "Vazir-Bold": require("../assets/fonts/Vazir-Bold-FD-WOL.ttf"),
    "Vazir-Light": require("../assets/fonts/Vazir-Light-FD-WOL.ttf"),
    "Vazir-Medium": require("../assets/fonts/Vazir-Medium-FD-WOL.ttf"),
    "Vazir-Thin": require("../assets/fonts/Vazir-Thin-FD-WOL.ttf"),
  });
};

export const getFontFamily = (
  isRTL: boolean,
  weight?: "light" | "regular" | "medium" | "bold"
) => {
  if (!isRTL) {
    return undefined; // Use system font for English
  }

  switch (weight) {
    case "light":
      return "Vazir-Light";
    case "medium":
      return "Vazir-Medium";
    case "bold":
      return "Vazir-Bold";
    default:
      return "Vazir";
  }
};
