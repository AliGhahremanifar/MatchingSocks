import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { DailyColor, Friend, SockColor, SockGroup } from "../types";

const STORAGE_KEYS = {
  FRIENDS: "matching_socks_friends",
  COLORS: "matching_socks_colors",
  GROUPS: "matching_socks_groups",
  DAILY_COLORS: "matching_socks_daily_colors",
  IS_FIRST_TIME: "matching_socks_first_time",
  GROUP_PICTURE: "matching_socks_group_picture",
};

// Default sock colors
export const DEFAULT_COLORS: SockColor[] = [
  { id: "1", name: "Red", hexCode: "#FF0000", isDefault: true },
  { id: "2", name: "Blue", hexCode: "#0000FF", isDefault: true },
  { id: "3", name: "Green", hexCode: "#00FF00", isDefault: true },
  { id: "4", name: "Yellow", hexCode: "#FFFF00", isDefault: true },
  { id: "5", name: "Purple", hexCode: "#800080", isDefault: true },
  { id: "6", name: "Orange", hexCode: "#FFA500", isDefault: true },
  { id: "7", name: "Pink", hexCode: "#FFC0CB", isDefault: true },
  { id: "8", name: "Brown", hexCode: "#A52A2A", isDefault: true },
  { id: "9", name: "Black", hexCode: "#000000", isDefault: true },
  { id: "10", name: "White", hexCode: "#FFFFFF", isDefault: true },
  { id: "11", name: "Gray", hexCode: "#808080", isDefault: true },
  { id: "12", name: "Cyan", hexCode: "#00FFFF", isDefault: true },
  { id: "13", name: "Lime", hexCode: "#32CD32", isDefault: true },
  { id: "14", name: "Teal", hexCode: "#008080", isDefault: true },
  { id: "15", name: "Indigo", hexCode: "#4B0082", isDefault: true },
  { id: "16", name: "Violet", hexCode: "#8A2BE2", isDefault: true },
  { id: "17", name: "Rose", hexCode: "#FF1493", isDefault: true },
  { id: "18", name: "Amber", hexCode: "#FFBF00", isDefault: true },
  { id: "19", name: "Emerald", hexCode: "#50C878", isDefault: true },
  { id: "20", name: "Sky", hexCode: "#87CEEB", isDefault: true },
  { id: "21", name: "Slate", hexCode: "#708090", isDefault: true },
  { id: "22", name: "Zinc", hexCode: "#71797E", isDefault: true },
  { id: "23", name: "Neutral", hexCode: "#808080", isDefault: true },
  { id: "24", name: "Stone", hexCode: "#928E85", isDefault: true },
];

// Extended colors for "See More" section
export const EXTENDED_COLORS: SockColor[] = [
  { id: "25", name: "Red-500", hexCode: "#EF4444", isDefault: false },
  { id: "26", name: "Blue-500", hexCode: "#3B82F6", isDefault: false },
  { id: "27", name: "Green-500", hexCode: "#10B981", isDefault: false },
  { id: "28", name: "Yellow-500", hexCode: "#F59E0B", isDefault: false },
  { id: "29", name: "Purple-500", hexCode: "#8B5CF6", isDefault: false },
  { id: "30", name: "Pink-500", hexCode: "#EC4899", isDefault: false },
  { id: "31", name: "Indigo-500", hexCode: "#6366F1", isDefault: false },
  { id: "32", name: "Gray-500", hexCode: "#6B7280", isDefault: false },
];

// Helper function to get translated color name
export const getTranslatedColorName = (
  colorName: string,
  t: (key: string) => string
): string => {
  const colorKey = colorName.toLowerCase();
  const translatedName = t(`colors.${colorKey}`);

  // If translation exists, return it; otherwise return the original name
  // This handles both predefined colors (with translations) and custom colors (without translations)
  return translatedName || colorName;
};

// Friends storage
export const saveFriends = async (friends: Friend[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
  } catch (error) {
    console.error("Error saving friends:", error);
  }
};

export const getFriends = async (): Promise<Friend[]> => {
  try {
    const friendsJson = await AsyncStorage.getItem(STORAGE_KEYS.FRIENDS);
    return friendsJson ? JSON.parse(friendsJson) : [];
  } catch (error) {
    console.error("Error getting friends:", error);
    return [];
  }
};

// Colors storage
export const saveColors = async (colors: SockColor[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(colors));
  } catch (error) {
    console.error("Error saving colors:", error);
  }
};

export const getColors = async (): Promise<SockColor[]> => {
  try {
    const colorsJson = await AsyncStorage.getItem(STORAGE_KEYS.COLORS);
    return colorsJson ? JSON.parse(colorsJson) : DEFAULT_COLORS;
  } catch (error) {
    console.error("Error getting colors:", error);
    return DEFAULT_COLORS;
  }
};

// Groups storage
export const saveGroups = async (groups: SockGroup[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  } catch (error) {
    console.error("Error saving groups:", error);
  }
};

export const getGroups = async (): Promise<SockGroup[]> => {
  try {
    const groupsJson = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
    return groupsJson ? JSON.parse(groupsJson) : [];
  } catch (error) {
    console.error("Error getting groups:", error);
    return [];
  }
};

// Daily colors storage
export const saveDailyColors = async (
  dailyColors: DailyColor[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.DAILY_COLORS,
      JSON.stringify(dailyColors)
    );
  } catch (error) {
    console.error("Error saving daily colors:", error);
  }
};

export const getDailyColors = async (): Promise<DailyColor[]> => {
  try {
    const dailyColorsJson = await AsyncStorage.getItem(
      STORAGE_KEYS.DAILY_COLORS
    );
    return dailyColorsJson ? JSON.parse(dailyColorsJson) : [];
  } catch (error) {
    console.error("Error getting daily colors:", error);
    return [];
  }
};

// First time check
export const isFirstTime = async (): Promise<boolean> => {
  try {
    const firstTime = await AsyncStorage.getItem(STORAGE_KEYS.IS_FIRST_TIME);
    return firstTime === null;
  } catch (error) {
    console.error("Error checking first time:", error);
    return true;
  }
};

export const setFirstTimeComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_TIME, "false");
  } catch (error) {
    console.error("Error setting first time complete:", error);
  }
};

export const resetFirstTime = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.IS_FIRST_TIME);
  } catch (error) {
    console.error("Error resetting first time:", error);
  }
};

// Generate random color for today
export const generateTodaysColor = async (): Promise<SockColor> => {
  const colors = await getColors();
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

// Get today's color or generate new one
export const getTodaysColor = async (): Promise<SockColor> => {
  const today = new Date().toISOString().split("T")[0];
  const dailyColors = await getDailyColors();

  const todaysColor = dailyColors.find((dc) => dc.date === today);

  if (todaysColor) {
    return todaysColor.color;
  }

  // Generate new color for today
  const newColor = await generateTodaysColor();
  const newDailyColor: DailyColor = {
    date: today,
    color: newColor,
  };

  dailyColors.push(newDailyColor);
  await saveDailyColors(dailyColors);

  return newColor;
};

// Group picture storage
export const saveGroupPicture = async (pictureUri: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GROUP_PICTURE, pictureUri);
  } catch (error) {
    console.error("Error saving group picture:", error);
  }
};

export const getGroupPicture = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.GROUP_PICTURE);
  } catch (error) {
    console.error("Error getting group picture:", error);
    return null;
  }
};

// Image picker utilities
export const pickImage = async (): Promise<string | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error("Error picking image:", error);
    return null;
  }
};

export const takePhoto = async (): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      // Note: This alert will be in English since we can't access translations here
      // The actual translated message is handled in the ProfilePicturePicker component
      alert("Sorry, we need camera permissions to make this work!");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error("Error taking photo:", error);
    return null;
  }
};
