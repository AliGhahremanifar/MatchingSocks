import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import ViewShot from "react-native-view-shot";

import { useTranslation } from "react-i18next";
import AdBanner from "../../components/AdBanner";
import ShareableCard from "../../components/ShareableCard";
import { Text, View } from "../../components/Themed";
import { useLanguage } from "../../hooks/useLanguage";
import { Friend, SockColor } from "../../types";
import { formatDate } from "../../utils/dateUtils";
import {
  generateTodaysColor,
  getDailyColors,
  getFriends,
  getGroupPicture,
  getTodaysColor,
  getTranslatedColorName,
  saveDailyColors,
} from "../../utils/storage";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [todaysColor, setTodaysColor] = useState<SockColor | null>(null);
  const [groupPicture, setGroupPicture] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [isStreakDay, setIsStreakDay] = useState(true);
  const [streakDays, setStreakDays] = useState(0);
  const [lastShareDate, setLastShareDate] = useState<string | null>(null);
  const [consecutiveMissedDays, setConsecutiveMissedDays] = useState(0);
  const shareableCardRef = useRef<ViewShot>(null);

  const loadData = async () => {
    try {
      const [friendsData, colorData, pictureData] = await Promise.all([
        getFriends(),
        getTodaysColor(),
        getGroupPicture(),
      ]);
      setFriends(friendsData);
      setTodaysColor(colorData);
      setGroupPicture(pictureData);

      // Load streak data
      const [storedStreakDays, storedLastShareDate, storedMissedDays] =
        await Promise.all([
          AsyncStorage.getItem("streakDays"),
          AsyncStorage.getItem("lastShareDate"),
          AsyncStorage.getItem("consecutiveMissedDays"),
        ]);

      // console.log("Loading streak data:", {
      //   storedStreakDays,
      //   storedLastShareDate,
      //   storedMissedDays,
      // });

      if (storedStreakDays) {
        const loadedStreak = parseInt(storedStreakDays);
        setStreakDays(loadedStreak);
        console.log(`Loaded streak: ${loadedStreak}`);
      } else {
        console.log("No stored streak found, initializing to 0");
        setStreakDays(0);
        // Initialize streak data if it doesn't exist
        await AsyncStorage.setItem("streakDays", "0");
      }
      if (storedLastShareDate) {
        setLastShareDate(storedLastShareDate);
        // console.log(`Loaded last share date: ${storedLastShareDate}`);
      }
      if (storedMissedDays) {
        setConsecutiveMissedDays(parseInt(storedMissedDays));
        // console.log(`Loaded missed days: ${storedMissedDays}`);
      }

      // Check streak status only if we have a last share date
      if (storedLastShareDate) {
        await checkStreakStatus();
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const changeTodaysColor = async () => {
    try {
      const newColor = await generateTodaysColor();
      const today = new Date().toISOString().split("T")[0];
      const dailyColors = await getDailyColors();

      // Update today's color
      const existingIndex = dailyColors.findIndex((dc) => dc.date === today);
      if (existingIndex >= 0) {
        dailyColors[existingIndex].color = newColor;
      } else {
        dailyColors.push({ date: today, color: newColor });
      }

      await saveDailyColors(dailyColors);
      setTodaysColor(newColor);

      Alert.alert(
        "",
        t("home.colorChangedMessage", {
          color: getTranslatedColorName(newColor.name, t),
        })
      );
    } catch (error) {
      console.error("Error changing today's color:", error);
      Alert.alert(t("common.error"), t("home.colorChangeError"));
    }
  };

  const addFriendFromHome = () => {
    // Navigate to settings tab to add friend
    // We'll use a simple alert for now since tab navigation is handled by the tab bar
    Alert.alert(t("home.addFriendTitle"), t("home.addFriendMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("home.goToSettings"),
        onPress: () => {
          // The user can manually navigate to settings tab
        },
      },
    ]);
  };

  const shareTodaysColor = async () => {
    if (!todaysColor || sharing) return;

    setSharing(true);
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("common.error"), t("share.permissionDenied"));
        return;
      }

      // Capture the shareable card as image
      const uri = await shareableCardRef.current?.capture?.();
      if (!uri) {
        Alert.alert(t("common.error"), t("share.captureError"));
        return;
      }

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: t("share.todaysColor"),
      });

      // Update streak after successful share
      console.log("Share successful, updating streak...");
      await updateStreakOnShare();

      // Small delay to ensure state is properly updated
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert(t("common.error"), t("share.shareError"));
    } finally {
      setSharing(false);
    }
  };

  const checkStreakStatus = async () => {
    const today = new Date().toISOString().split("T")[0];

    if (!lastShareDate) {
      // First time using the app
      // console.log("First time using app, no streak check needed");
      return;
    }

    const daysDiff = Math.floor(
      (new Date(today).getTime() - new Date(lastShareDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // console.log(`Days since last share: ${daysDiff}`);

    if (daysDiff === 0) {
      // Same day, no change needed
      // console.log("Same day as last share, no change needed");
      return;
    } else if (daysDiff === 1) {
      // Missed one day - freeze streak
      // console.log("Missed one day, freezing streak");
      setConsecutiveMissedDays(1);
      await AsyncStorage.setItem("consecutiveMissedDays", "1");
    } else if (daysDiff >= 2) {
      // Missed 2 or more days - reset streak
      // console.log("Missed 2+ days, resetting streak to 0");
      setStreakDays(0);
      setConsecutiveMissedDays(0);
      await Promise.all([
        AsyncStorage.setItem("streakDays", "0"),
        AsyncStorage.setItem("consecutiveMissedDays", "0"),
      ]);
    }
  };

  const updateStreakOnShare = async () => {
    const today = new Date().toISOString().split("T")[0];

    console.log(
      `Attempting to update streak. Today: ${today}, Last share: ${lastShareDate}`
    );

    if (lastShareDate === today) {
      // Already shared today, don't increment
      // console.log("Already shared today, no increment");
      return;
    }

    // Calculate new streak based on missed days
    let newStreakDays = streakDays;

    if (lastShareDate) {
      const daysDiff = Math.floor(
        (new Date(today).getTime() - new Date(lastShareDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Missed one day, continue from current streak
        newStreakDays = streakDays + 1;
        console.log(
          `Missed one day, continuing streak: ${streakDays} → ${newStreakDays}`
        );
      } else if (daysDiff >= 2) {
        // Missed 2+ days, start new streak
        newStreakDays = 1;
        console.log(
          `Missed 2+ days, starting new streak: ${streakDays} → ${newStreakDays}`
        );
      } else {
        // Same day or first time, increment normally
        newStreakDays = streakDays + 1;
        console.log(`Normal increment: ${streakDays} → ${newStreakDays}`);
      }
    } else {
      // First time sharing
      newStreakDays = 1;
      console.log(`First time sharing, starting streak: 0 → ${newStreakDays}`);
    }

    // Update state first
    setStreakDays(newStreakDays);
    setLastShareDate(today);
    setConsecutiveMissedDays(0);

    // Then save to storage
    await Promise.all([
      AsyncStorage.setItem("streakDays", newStreakDays.toString()),
      AsyncStorage.setItem("lastShareDate", today),
      AsyncStorage.setItem("consecutiveMissedDays", "0"),
    ]);

    // console.log(`Streak successfully updated to: ${newStreakDays}`);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus (e.g., when returning from settings)
  useFocusEffect(
    React.useCallback(() => {
      // Only reload data if we're not currently sharing
      if (!sharing) {
        loadData();
      }
    }, [sharing])
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <AdBanner streakDays={streakDays} />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{t("home.title")}</Text>
            <Text style={styles.date}>{formatDate(new Date(), isRTL)}</Text>
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

      {todaysColor && (
        <View style={styles.colorCard}>
          {isStreakDay && (
            <View style={styles.streakDayBadge}>
              <Ionicons name="trophy" size={16} color="#FFFFFF" />
              <Text style={styles.streakDayBadgeText}>🔥 {streakDays}</Text>
            </View>
          )}
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
            <Text style={styles.colorName}>{todaysColor.name}</Text>
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
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.changeColorButton,
                isRTL && styles.rtlChangeColorButton,
              ]}
              onPress={changeTodaysColor}
            >
              <Ionicons name="shuffle-outline" size={18} color="#007AFF" />
              <Text
                style={[
                  styles.changeColorButtonText,
                  isRTL && styles.rtlChangeColorButtonText,
                ]}
              >
                {t("home.changeColor")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, isRTL && styles.rtlShareButton]}
              onPress={shareTodaysColor}
              disabled={sharing}
            >
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              <Text
                style={[
                  styles.shareButtonText,
                  isRTL && styles.rtlShareButtonText,
                ]}
              >
                {t("share.share")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.friendsSection}>
        <View style={{ padding: 10 }}>
          <Text style={styles.sectionTitle}>{t("home.yourGroup")}</Text>
          <Text style={styles.sectionSubtitle}>
            {t("home.friendsInGroup", {
              count: friends.length,
              plural: friends.length !== 1 ? "s" : "",
            })}
          </Text>
        </View>

        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyText}>{t("home.noFriendsYet")}</Text>
            <Text style={styles.emptySubtext}>
              {t("home.addFriendsSettings")}
            </Text>
            <TouchableOpacity
              style={[
                styles.addFriendButton,
                isRTL && styles.rtlAddFriendButton,
              ]}
              onPress={addFriendFromHome}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text
                style={[
                  styles.addFriendButtonText,
                  isRTL && styles.rtlAddFriendButtonText,
                ]}
              >
                {t("home.addFriend")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.friendsList}>
            {friends.map((friend, index) => (
              <View key={friend.id} style={styles.friendCard}>
                <View style={styles.friendInfo}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: todaysColor?.hexCode },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {friend.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.friendDetails}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendStatus}>
                      {todaysColor
                        ? t("home.shouldWearSocks", {
                            color: getTranslatedColorName(todaysColor.name, t),
                          })
                        : t("home.readyToMatch")}
                    </Text>
                  </View>
                </View>
                <View style={styles.checkIcon}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={24}
                    color={todaysColor?.hexCode || "#34C759"}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.tipCard}>
        <Ionicons name="bulb-outline" size={24} color="#FF9500" />
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>{t("home.proTip")}</Text>
          <Text style={styles.tipText}>{t("home.proTipText")}</Text>
        </View>
      </View>

      <View style={styles.sockStatsCard}>
        <Text style={styles.statsTitle}>{t("home.sockStats")}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{friends.length}</Text>
            <Text style={styles.statLabel}>{t("home.sockBuddies")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>🧦</Text>
            <Text style={styles.statLabel}>{t("home.readyToMatch")}</Text>
          </View>
        </View>
      </View>

      {/* Hidden ShareableCard for capturing as image */}
      <View style={styles.hiddenCard}>
        <ViewShot
          ref={shareableCardRef}
          options={{ format: "png", quality: 0.9 }}
        >
          {todaysColor && (
            <ShareableCard
              todaysColor={todaysColor}
              groupPicture={groupPicture}
              friendsCount={friends.length}
              isRTL={isRTL}
              isStreakDay={isStreakDay}
              streakDays={streakDays}
            />
          )}
        </ViewShot>
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
    fontSize: 32,
    fontFamily: "Vazir-Bold",
    color: "#333",
    paddingVertical: 5,
  },
  date: {
    fontSize: 16,
    fontFamily: "Vazir-Medium",
    color: "#8E8E93",
  },
  colorCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  colorTitle: {
    fontSize: 18,
    fontFamily: "Vazir-Bold",
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
    fontFamily: "Vazir-Bold",
    color: "#333",
  },
  colorDescription: {
    fontSize: 16,
    fontFamily: "Vazir-Medium",
    color: "#666",
    lineHeight: 22,
  },
  friendsSection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Vazir-Medium",
    color: "#8E8E93",
    marginBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Vazir-Medium",
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
  friendsList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  friendInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: "Vazir-Bold",
    color: "#fff",
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 14,
    fontFamily: "Vazir-Medium",
    color: "#8E8E93",
  },
  checkIcon: {
    marginLeft: 10,
  },
  tipCard: {
    flexDirection: "row",
    margin: 20,
    padding: 15,
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  tipContent: {
    flex: 1,
    marginLeft: 10,
    padding: 5,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    fontFamily: "Vazir-Medium",
    color: "#666",
    lineHeight: 20,
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
  sockStatsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    fontSize: 24,
    fontFamily: "Vazir-Bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Vazir-Medium",
    color: "#8E8E93",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F2F2F7",
  },
  changeColorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F8FF",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  rtlChangeColorButton: {
    flexDirection: "row-reverse",
  },
  changeColorButtonText: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#007AFF",
    marginLeft: 8,
  },
  rtlChangeColorButtonText: {
    marginLeft: 0,
    marginRight: 8,
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rtlAddFriendButton: {
    flexDirection: "row-reverse",
  },
  addFriendButtonText: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#fff",
    marginLeft: 8,
  },
  rtlAddFriendButtonText: {
    marginLeft: 0,
    marginRight: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 10,
    gap: 10,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    borderWidth: 1,
    borderColor: "#34C759",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  rtlShareButton: {
    flexDirection: "row-reverse",
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  rtlShareButtonText: {
    marginLeft: 0,
    marginRight: 8,
  },

  streakDayBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  streakDayBadgeText: {
    fontSize: 12,
    fontFamily: "Vazir-Bold",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  hiddenCard: {
    position: "absolute",
    top: -9999,
    left: -9999,
    opacity: 0,
  },
});
