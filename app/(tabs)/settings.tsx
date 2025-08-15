import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "react-i18next";
import EnhancedColorPicker from "../../components/EnhancedColorPicker";
import LanguageSelector from "../../components/LanguageSelector";
import ProfilePicturePicker from "../../components/ProfilePicturePicker";
import { useLanguage } from "../../hooks/useLanguage";
import { Friend, SockColor } from "../../types";
import {
  getColors,
  getFriends,
  getGroupPicture,
  getTranslatedColorName,
  resetFirstTime,
  saveColors,
  saveFriends,
  saveGroupPicture,
} from "../../utils/storage";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [colors, setColors] = useState<SockColor[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [groupPicture, setGroupPicture] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [friendsData, colorsData, pictureData] = await Promise.all([
        getFriends(),
        getColors(),
        getGroupPicture(),
      ]);
      setFriends(friendsData);
      setColors(colorsData);
      setGroupPicture(pictureData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const addFriend = async () => {
    if (newFriendName.trim()) {
      const newFriend: Friend = {
        id: Date.now().toString(),
        name: newFriendName.trim(),
      };
      const updatedFriends = [...friends, newFriend];
      setFriends(updatedFriends);
      await saveFriends(updatedFriends);
      setNewFriendName("");
      setShowAddFriend(false);
    }
  };

  const removeFriend = async (id: string) => {
    Alert.alert(
      t("settings.removeFriendTitle"),
      t("settings.removeFriendMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.remove"),
          style: "destructive",
          onPress: async () => {
            const updatedFriends = friends.filter((friend) => friend.id !== id);
            setFriends(updatedFriends);
            await saveFriends(updatedFriends);
          },
        },
      ]
    );
  };

  const toggleColor = async (color: SockColor) => {
    const isSelected = colors.some((c) => c.id === color.id);
    let updatedColors: SockColor[];

    if (isSelected) {
      updatedColors = colors.filter((c) => c.id !== color.id);
    } else {
      updatedColors = [...colors, color];
    }

    setColors(updatedColors);
    await saveColors(updatedColors);
  };

  const addCustomColor = async (hexCode: string, colorName: string) => {
    const newColor: SockColor = {
      id: `custom-${Date.now()}`,
      name: colorName,
      hexCode,
      isDefault: false,
    };

    const updatedColors = [...colors, newColor];
    setColors(updatedColors);
    await saveColors(updatedColors);
  };

  const handleGroupPictureChange = async (pictureUri: string) => {
    setGroupPicture(pictureUri);
    await saveGroupPicture(pictureUri);
  };

  const resetToOnboarding = async () => {
    Alert.alert(t(""), t("settings.resetAppMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.resetApp"),
        style: "destructive",
        onPress: async () => {
          await resetFirstTime();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const resetStreak = async () => {
    Alert.alert(
      "Reset Streak",
      "Are you sure you want to reset your streak to 0?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await Promise.all([
              AsyncStorage.setItem("streakDays", "0"),
              AsyncStorage.setItem("lastShareDate", ""),
              AsyncStorage.setItem("consecutiveMissedDays", "0"),
            ]);
            Alert.alert("Success", "Streak has been reset to 0");
          },
        },
      ]
    );
  };

  const renderAddFriendModal = () => (
    <Modal
      visible={showAddFriend}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddFriend(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, isRTL && styles.rtlModalTitle]}>
            {t("settings.addNewFriend")}
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder={t("settings.enterFriendName")}
            value={newFriendName}
            onChangeText={setNewFriendName}
            autoFocus
            textAlign={isRTL ? "right" : "left"}
          />
          <View style={[styles.modalButtons, isRTL && styles.rtlModalButtons]}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowAddFriend(false)}
            >
              <Text style={styles.modalButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={addFriend}
            >
              <Text
                style={[styles.modalButtonText, styles.modalButtonTextPrimary]}
              >
                {t("common.add")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderColorPickerModal = () => (
    <EnhancedColorPicker
      visible={showColorPicker}
      onClose={() => setShowColorPicker(false)}
      selectedColors={colors}
      onColorToggle={toggleColor}
      onCustomColorAdd={addCustomColor}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.rtlTitle]}>Settings</Text>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <LanguageSelector />
      </View>

      {/* Group Picture Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlSectionTitle]}>
          {t("settings.groupPicture")}
        </Text>
        <Text
          style={[styles.sectionSubtitle, isRTL && styles.rtlSectionSubtitle]}
        >
          {t("settings.groupPictureDesc")}
        </Text>
        <View style={styles.groupPictureSection}>
          <ProfilePicturePicker
            currentPicture={groupPicture}
            onPictureSelected={handleGroupPictureChange}
            size={80}
          />
        </View>
      </View>

      {/* Friends Section */}
      <View style={styles.section}>
        <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlSectionTitle]}>
            {t("settings.friends")}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddFriend(true)}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <Text
          style={[styles.sectionSubtitle, isRTL && styles.rtlSectionSubtitle]}
        >
          {t("settings.friendsDesc")}
        </Text>

        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={32} color="#8E8E93" />
            <Text style={[styles.emptyText, isRTL && styles.rtlEmptyText]}>
              {t("settings.noFriendsAdded")}
            </Text>
            <Text
              style={[styles.emptySubtext, isRTL && styles.rtlEmptySubtext]}
            >
              {t("settings.addFriendsButton")}
            </Text>
          </View>
        ) : (
          <View style={styles.friendsList}>
            {friends.map((friend) => (
              <View
                key={friend.id}
                style={[styles.friendItem, isRTL && styles.rtlFriendItem]}
              >
                <View
                  style={[styles.friendInfo, isRTL && styles.rtlFriendInfo]}
                >
                  <View style={[styles.avatar, isRTL && styles.rtlAvatar]}>
                    <Text style={styles.avatarText}>
                      {friend.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[styles.friendName, isRTL && styles.rtlFriendName]}
                  >
                    {friend.name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFriend(friend.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Colors Section */}
      <View style={styles.section}>
        <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlSectionTitle]}>
            {t("settings.sockColors")}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowColorPicker(true)}
          >
            <Ionicons name="color-palette-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <Text
          style={[styles.sectionSubtitle, isRTL && styles.rtlSectionSubtitle]}
        >
          {t("settings.sockColorsDesc")}
        </Text>

        <View style={styles.colorsGrid}>
          {colors.map((color) => (
            <View key={color.id} style={styles.colorItem}>
              <View
                style={[styles.colorCircle, { backgroundColor: color.hexCode }]}
              />
              <Text style={styles.colorName}>
                {getTranslatedColorName(color.name, t)}
              </Text>
            </View>
          ))}
        </View>

        {colors.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="color-palette-outline" size={32} color="#8E8E93" />
            <Text style={[styles.emptyText, isRTL && styles.rtlEmptyText]}>
              {t("settings.noColorsSelected")}
            </Text>
            <Text
              style={[styles.emptySubtext, isRTL && styles.rtlEmptySubtext]}
            >
              {t("settings.selectColorsButton")}
            </Text>
          </View>
        )}
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlSectionTitle]}>
          {t("settings.appInfo")}
        </Text>

        <TouchableOpacity
          style={[styles.infoItem, isRTL && styles.rtlInfoItem]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#007AFF"
          />
          <Text style={[styles.infoText, isRTL && styles.rtlInfoText]}>
            {t("settings.version")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.infoItem, isRTL && styles.rtlInfoItem]}
          onPress={resetToOnboarding}
        >
          <Ionicons name="refresh-outline" size={20} color="#FF9500" />
          <Text style={[styles.infoText, isRTL && styles.rtlInfoText]}>
            {t("settings.resetApp")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
        </TouchableOpacity>
        {/* 
        <TouchableOpacity
          style={[styles.infoItem, isRTL && styles.rtlInfoItem]}
          onPress={resetStreak}
        >
          <Ionicons name="trophy-outline" size={20} color="#FF3B30" />
          <Text style={[styles.infoText, isRTL && styles.rtlInfoText]}>
            Reset Streak
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
        </TouchableOpacity> */}

        <View
          style={[
            styles.poweredByContainer,
            isRTL && styles.rtlPoweredByContainer,
          ]}
        >
          <Text
            style={[styles.poweredByText, isRTL && styles.rtlPoweredByText]}
          >
            Powered by AI Colonizer
          </Text>
        </View>
      </View>

      {renderAddFriendModal()}
      {renderColorPickerModal()}
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
  },
  section: {
    margin: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Vazir-Bold",
    color: "#333",
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Vazir-Medium",
    color: "#8E8E93",
    marginBottom: 15,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginTop: 10,
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
    borderRadius: 12,
    overflow: "hidden",
  },
  friendItem: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#fff",
  },
  friendName: {
    fontSize: 16,
    fontFamily: "Vazir-Medium",
    color: "#333",
  },
  removeButton: {
    padding: 5,
  },
  colorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
  },
  colorItem: {
    alignItems: "center",
    marginBottom: 15,
    marginRight: 15,
    minWidth: 60,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: "#E5E5EA",
  },
  colorName: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    fontFamily: "Vazir-Medium",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Vazir-Medium",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#F2F2F7",
  },
  modalButtonPrimary: {
    backgroundColor: "#007AFF",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#333",
  },
  modalButtonTextPrimary: {
    color: "#fff",
  },
  colorPickerList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  colorPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  colorPickerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#E5E5EA",
  },
  selectedColorCircle: {
    borderColor: "#007AFF",
    borderWidth: 3,
  },
  colorPickerName: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Vazir-Medium",
    color: "#333",
  },
  groupPictureSection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  // RTL Styles
  rtlTitle: {
    textAlign: "right",
  },
  rtlSectionTitle: {
    textAlign: "right",
  },
  rtlSectionSubtitle: {
    textAlign: "right",
    fontFamily: "Vazir-Bold",
  },
  rtlSectionHeader: {
    flexDirection: "row-reverse",
  },
  rtlEmptyText: {
    textAlign: "center",
    fontFamily: "Vazir-Bold",
  },
  rtlEmptySubtext: {
    textAlign: "center",
    fontFamily: "Vazir-Medium",
  },
  rtlFriendItem: {
    flexDirection: "row-reverse",
  },
  rtlFriendInfo: {
    flexDirection: "row-reverse",
  },
  rtlAvatar: {
    marginRight: 0,
    marginLeft: 15,
  },
  rtlFriendName: {
    textAlign: "right",
  },
  rtlInfoItem: {
    flexDirection: "row-reverse",
  },
  rtlInfoText: {
    marginLeft: 0,
    marginRight: 15,
    textAlign: "right",
    fontFamily: "Vazir-Medium",
  },
  rtlModalTitle: {
    textAlign: "right",
  },
  rtlModalButtons: {
    flexDirection: "row-reverse",
  },
  rtlColorPickerItem: {
    flexDirection: "row-reverse",
  },
  rtlColorPickerName: {
    textAlign: "right",
  },
  poweredByContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  rtlPoweredByContainer: {
    alignItems: "center",
  },
  poweredByText: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
    textAlign: "center",
  },
  rtlPoweredByText: {
    textAlign: "center",
    fontFamily: "Vazir-Medium",
  },
});
