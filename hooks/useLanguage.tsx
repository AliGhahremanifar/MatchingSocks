import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = "matching_socks_language";

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [currentLanguage, setCurrentLanguage] = useState("fa"); // Default to Farsi
  const { i18n } = useTranslation();

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  // Ensure i18n language is set when component mounts
  useEffect(() => {
    console.log("LanguageProvider mounted, current language:", currentLanguage); // Debug log
    console.log("i18n language:", i18n.language); // Debug log

    // Force set the language if it doesn't match
    if (i18n.language !== currentLanguage) {
      console.log("Forcing i18n language to match current language"); // Debug log
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  const loadSavedLanguage = async () => {
    try {
      console.log("Loading saved language..."); // Debug log
      console.log("Current i18n language:", i18n.language); // Debug log
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      console.log("Saved language from storage:", savedLanguage); // Debug log

      if (savedLanguage) {
        console.log("Setting saved language:", savedLanguage); // Debug log
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      } else {
        // If no saved language, set to Farsi (default)
        console.log("No saved language, setting to Farsi"); // Debug log
        setCurrentLanguage("fa");
        i18n.changeLanguage("fa");
      }

      console.log("Final i18n language:", i18n.language); // Debug log
    } catch (error) {
      console.error("Error loading saved language:", error);
      // Fallback to Farsi on error
      setCurrentLanguage("fa");
      i18n.changeLanguage("fa");
    }
  };

  const changeLanguage = async (language: string) => {
    try {
      setCurrentLanguage(language);
      i18n.changeLanguage(language);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const isRTL = currentLanguage === "fa";

  return (
    <LanguageContext.Provider
      value={{ currentLanguage, changeLanguage, isRTL }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
