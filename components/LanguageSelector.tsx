import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../hooks/useLanguage";

export default function LanguageSelector() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();

  const languages = [
    { code: "fa", name: "فارسی", flag: "🇮🇷" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "nl", name: "Dutch", flag: "🇳🇱" },
  ];

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <Text style={[styles.title, isRTL && styles.rtlTitle]}>
        {t("settings.language")}
      </Text>
      <View
        style={[styles.languageContainer, isRTL && styles.rtlLanguageContainer]}
      >
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              isRTL && styles.rtlLanguageButton,
              currentLanguage === language.code && styles.selectedLanguage,
            ]}
            onPress={() => changeLanguage(language.code)}
          >
            <Text style={[styles.flag, isRTL && styles.rtlFlag]}>
              {language.flag}
            </Text>
            <Text
              style={[
                styles.languageName,
                currentLanguage === language.code &&
                  styles.selectedLanguageText,
              ]}
            >
              {language.name}
            </Text>
            {currentLanguage === language.code && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  containerRTL: {
    alignItems: "flex-end",
  },
  rtlTitle: {
    textAlign: "right",
  },
  rtlLanguageContainer: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginBottom: 10,
  },
  languageContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  rtlLanguageButton: {
    flexDirection: "row-reverse",
  },
  selectedLanguage: {
    backgroundColor: "#F0F8FF",
  },
  flag: {
    fontSize: 24,
    marginRight: 15,
  },
  rtlFlag: {
    marginRight: 0,
    marginLeft: 15,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  selectedLanguageText: {
    color: "#007AFF",
    fontFamily: "Vazir-Bold",
  },
});
