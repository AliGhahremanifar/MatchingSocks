import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "react-i18next";
import { SockColor } from "../types";
import { getTranslatedColorName } from "../utils/storage";

interface ShareableCardProps {
  todaysColor: SockColor;
  groupPicture?: string | null;
  friendsCount: number;
  isRTL: boolean;
}

export default function ShareableCard({
  todaysColor,
  groupPicture,
  friendsCount,
  isRTL,
}: ShareableCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{t("home.title")}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          </View>
          {groupPicture && (
            <View style={styles.groupPictureContainer}>
              <Image
                source={{ uri: groupPicture }}
                style={styles.groupPicture}
              />
            </View>
          )}
        </View>
      </View>

      {/* Color Card */}
      <View style={styles.colorCard}>
        <View style={styles.sockIconContainer}>
          <Ionicons name="footsteps" size={24} color="#8E8E93" />
        </View>
        <Text style={styles.colorTitle}>{t("home.todaysColor")}</Text>
        <View style={styles.colorDisplay}>
          <View style={styles.sockPreview}>
            <View
              style={[
                styles.sockLeft,
                { backgroundColor: todaysColor.hexCode },
              ]}
            />
            <View
              style={[
                styles.sockRight,
                { backgroundColor: todaysColor.hexCode },
              ]}
            />
          </View>
          <Text style={styles.colorName}>
            {getTranslatedColorName(todaysColor.name, t)}
          </Text>
        </View>
        <Text style={styles.colorDescription}>
          {t("home.everyoneWear", {
            color: getTranslatedColorName(todaysColor.name, t),
          })}
        </Text>
        <View style={styles.sockEmojiContainer}>
          <Text style={styles.sockEmoji}>🧦</Text>
          <Text style={styles.sockEmoji}>🧦</Text>
          <Text style={styles.sockEmoji}>🧦</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t("share.friendsInGroup", { count: friendsCount })}
        </Text>
        <Text style={styles.appName}>Matching Socks</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 375,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleSection: {
    flex: 1,
  },
  groupPictureContainer: {
    marginLeft: 15,
  },
  groupPicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E5E5EA",
  },
  title: {
    fontSize: 28,
    fontFamily: "Vazir-Bold",
    color: "#333",
    paddingVertical: 5,
  },
  date: {
    fontSize: 16,
    color: "#8E8E93",
  },
  colorCard: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  colorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  sockIconContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  colorDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sockPreview: {
    flexDirection: "row",
    marginRight: 15,
    gap: 5,
  },
  sockLeft: {
    width: 25,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5EA",
  },
  sockRight: {
    width: 25,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5EA",
  },
  colorName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  colorDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  sockEmojiContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    gap: 10,
  },
  sockEmoji: {
    fontSize: 24,
  },
  footer: {
    alignItems: "center",
    padding: 20,
  },
  footerText: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
});
