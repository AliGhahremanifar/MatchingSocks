import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { useTranslation } from "react-i18next";
import AdBanner from "../../components/AdBanner";
import { Text, View } from "../../components/Themed";
import { useLanguage } from "../../hooks/useLanguage";
import { DailyColor } from "../../types";
import { getRelativeDate } from "../../utils/dateUtils";
import { getDailyColors, getTranslatedColorName } from "../../utils/storage";

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const [dailyColors, setDailyColors] = useState<DailyColor[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getDailyColors();
      // Sort by date (newest first)
      const sortedHistory = history.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setDailyColors(sortedHistory);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateString === today;
  };

  const isYesterday = (dateString: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];
    return dateString === yesterdayString;
  };

  const getDateLabel = (dateString: string) => {
    return getRelativeDate(dateString, isRTL, currentLanguage);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <AdBanner streakDays={0} />
      <View style={styles.header}>
        <Text style={styles.title}>{t("history.title")}</Text>
        <Text style={styles.subtitle}>{t("history.subtitle")}</Text>
      </View>

      {dailyColors.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🧦</Text>
          <Text style={styles.emptyTitle}>{t("history.noHistoryYet")}</Text>
          <Text style={styles.emptyText}>{t("history.noHistoryDesc")}</Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {dailyColors.map((dailyColor, index) => (
            <View
              key={dailyColor.date}
              style={[
                styles.historyItem,
                isToday(dailyColor.date) && styles.todayItem,
              ]}
            >
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>
                  {getDateLabel(dailyColor.date)}
                </Text>
                {isToday(dailyColor.date) && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>TODAY</Text>
                  </View>
                )}
              </View>

              <View style={styles.colorSection}>
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: dailyColor.color.hexCode },
                  ]}
                />
                <View style={styles.colorInfo}>
                  <Text style={styles.colorName}>
                    {getTranslatedColorName(dailyColor.color.name, t)}
                  </Text>
                  <Text style={styles.colorDescription}>
                    {isToday(dailyColor.date)
                      ? t("history.currentColor")
                      : t("history.sockColorForDay")}
                  </Text>
                </View>
              </View>

              {index < dailyColors.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>{t("history.sockMatchingStats")}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{dailyColors.length}</Text>
            <Text style={styles.statLabel}>{t("history.daysOfMatching")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Set(dailyColors.map((dc) => dc.color.id)).size}
            </Text>
            <Text style={styles.statLabel}>{t("history.sockColors")}</Text>
          </View>
        </View>
        <View style={styles.sockEmojiRow}>
          <Text style={styles.sockEmoji}>🧦</Text>
          <Text style={styles.sockEmoji}>🧦</Text>
          <Text style={styles.sockEmoji}>🧦</Text>
          <Text style={styles.sockEmoji}>🧦</Text>
          <Text style={styles.sockEmoji}>🧦</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 32,
    fontFamily: "Vazir-Bold",
    color: "#333",
    paddingTop: 20,
    paddingBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
  },
  emptyState: {
    alignItems: "center",
    padding: 60,
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Vazir-Medium",
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
  },
  historyList: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  historyItem: {
    padding: 20,
  },
  todayItem: {
    backgroundColor: "#F0F8FF",
  },
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 18,
    fontFamily: "Vazir-Bold",
    color: "#333",
  },
  todayBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 10,
    fontFamily: "Vazir-Bold",
    color: "#fff",
  },
  colorSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 3,
    borderColor: "#E5E5EA",
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: 20,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginBottom: 5,
  },
  colorDescription: {
    fontSize: 14,
    fontFamily: "Vazir-Medium",
    color: "#8E8E93",
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginTop: 20,
  },
  statsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F2F2F7",
  },
  sockEmojiRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    gap: 10,
  },
  sockEmoji: {
    fontSize: 20,
  },
});
