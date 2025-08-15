import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EnhancedColorPicker from "../components/EnhancedColorPicker";
import ProfilePicturePicker from "../components/ProfilePicturePicker";
import { useLanguage } from "../hooks/useLanguage";
import { Friend, SockColor } from "../types";
import {
  DEFAULT_COLORS,
  getTranslatedColorName,
  saveColors,
  saveFriends,
  saveGroupPicture,
  setFirstTimeComplete,
} from "../utils/storage";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendName, setNewFriendName] = useState("");
  const [selectedColors, setSelectedColors] =
    useState<SockColor[]>(DEFAULT_COLORS);
  const [groupPicture, setGroupPicture] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const addFriend = () => {
    if (newFriendName.trim()) {
      const newFriend: Friend = {
        id: Date.now().toString(),
        name: newFriendName.trim(),
      };
      setFriends([...friends, newFriend]);
      setNewFriendName("");
    }
  };

  const removeFriend = (id: string) => {
    setFriends(friends.filter((friend) => friend.id !== id));
  };

  const toggleColor = (color: SockColor) => {
    const isSelected = selectedColors.some((c) => c.id === color.id);
    if (isSelected) {
      setSelectedColors(selectedColors.filter((c) => c.id !== color.id));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const addCustomColor = (hexCode: string, colorName: string) => {
    const newColor: SockColor = {
      id: `custom-${Date.now()}`,
      name: colorName,
      hexCode,
      isDefault: false,
    };
    setSelectedColors([...selectedColors, newColor]);
  };

  const handleComplete = async () => {
    if (friends.length === 0) {
      Alert.alert(t("common.error"), t("onboarding.errorNoFriends"));
      return;
    }

    if (selectedColors.length === 0) {
      Alert.alert(t("common.error"), t("onboarding.errorNoColors"));
      return;
    }

    try {
      await saveFriends(friends);
      await saveColors(selectedColors);
      if (groupPicture) {
        await saveGroupPicture(groupPicture);
      }
      await setFirstTimeComplete();
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(t("common.error"), t("onboarding.errorSaveFailed"));
    }
  };

  const renderStep1 = () => (
    <View style={[styles.stepContainer, isRTL && styles.stepContainerRTL]}>
      <View style={styles.groupPictureSection}>
        <Text style={styles.title}>{t("onboarding.welcome")}</Text>
        <Text style={styles.subtitle}>{t("onboarding.subtitle")}</Text>
      </View>
      <View style={styles.groupPictureSection}>
        <Text style={styles.sectionTitle}>{t("onboarding.groupPicture")}</Text>
        <Text style={styles.description}>
          {t("onboarding.groupPictureDesc")}
        </Text>
        <ProfilePicturePicker
          currentPicture={groupPicture}
          onPictureSelected={setGroupPicture}
          size={100}
        />
      </View>
      <View style={styles.groupPictureSection}>
        <Text style={styles.sectionTitle}>{t("onboarding.addFriends")}</Text>
        <Text style={styles.description}>{t("onboarding.addFriendsDesc")}</Text>
      </View>
      <View style={[styles.inputContainer, isRTL && styles.rtlInputContainer]}>
        <TextInput
          style={styles.input}
          placeholder={t("onboarding.friendNamePlaceholder")}
          value={newFriendName}
          onChangeText={setNewFriendName}
          onSubmitEditing={addFriend}
          returnKeyType="done"
          textAlign={isRTL ? "right" : "left"}
          autoFocus={false}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.addButton, isRTL && styles.rtlAddButton]}
          onPress={addFriend}
        >
          <Text style={styles.addButtonText}>{t("common.add")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.friendsSection}>
        <Text style={styles.friendsCount}>
          {friends.length} {t("onboarding.friends")}
        </Text>
        <ScrollView
          style={styles.friendsList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.friendsGrid}>
            {friends.map((friend, index) => (
              <View
                key={friend.id}
                style={[
                  styles.friendCard,
                  isRTL && styles.rtlFriendCard,
                  index % 2 === 1 && styles.friendCardRight,
                ]}
              >
                <View style={[styles.avatar, isRTL && styles.rtlAvatar]}>
                  <Text style={styles.avatarText}>
                    {friend.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text
                  style={[styles.friendName, isRTL && styles.rtlFriendName]}
                  numberOfLines={1}
                >
                  {friend.name}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFriend(friend.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={[styles.stepContainer, isRTL && styles.stepContainerRTL]}>
      <Text style={styles.title}>{t("onboarding.chooseColors")}</Text>
      <Text style={styles.subtitle}>{t("onboarding.chooseColorsDesc")}</Text>

      <Text style={styles.description}>
        {t("onboarding.colorsDescription")}
      </Text>

      <View style={styles.colorPickerSection}>
        <Text style={styles.sectionTitle}>
          {t("onboarding.selectedColors")} ({selectedColors.length})
        </Text>

        <ScrollView style={styles.selectedColorsList}>
          {selectedColors.map((color) => (
            <View key={color.id} style={styles.selectedColorItem}>
              <View
                style={[styles.colorCircle, { backgroundColor: color.hexCode }]}
              />
              <Text style={styles.selectedColorName}>
                {getTranslatedColorName(color.name, t)}
              </Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.selectColorsButton}
          onPress={() => setShowColorPicker(true)}
        >
          <Text style={styles.selectColorsButtonText}>
            {t("onboarding.selectColors")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        {currentStep === 1 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              friends.length === 0 && styles.disabledButton,
            ]}
            onPress={() => setCurrentStep(2)}
            disabled={friends.length === 0}
          >
            <Text style={styles.nextButtonText}>{t("common.next")}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(1)}
            >
              <Text style={styles.backButtonText}>{t("common.back")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.completeButton,
                selectedColors.length === 0 && styles.disabledButton,
              ]}
              onPress={handleComplete}
              disabled={selectedColors.length === 0}
            >
              <Text style={styles.completeButtonText}>
                {t("onboarding.completeSetup")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <EnhancedColorPicker
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        selectedColors={selectedColors}
        onColorToggle={toggleColor}
        onCustomColorAdd={addCustomColor}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f5f5f5",
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Vazir-Bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Vazir-Medium",
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Vazir-Medium",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontFamily: "Vazir-Medium",
    marginBottom: 20,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontFamily: "Vazir-Bold",
    fontSize: 16,
  },

  colorsGrid: {
    flex: 1,
    marginBottom: 20,
  },
  colorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  colorItem: {
    width: "48%",
    height: 80,
    borderRadius: 12,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#007AFF",
    borderWidth: 3,
  },
  checkmark: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#007AFF",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  colorName: {
    fontSize: 14,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nextButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Vazir-Bold",
  },
  backButton: {
    backgroundColor: "#8E8E93",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Vazir-Bold",
  },
  completeButton: {
    backgroundColor: "#34C759",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Vazir-Bold",
  },
  disabledButton: {
    backgroundColor: "#C7C7CC",
  },
  groupPictureSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  stepContainerRTL: {
    alignItems: "flex-end",
  },
  rtlInputContainer: {
    flexDirection: "row-reverse",
  },
  rtlAddButton: {
    marginLeft: 0,
    marginRight: 10,
  },
  colorPickerSection: {
    marginBottom: 20,
  },
  selectedColorsList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  selectedColorItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  selectedColorName: {
    fontSize: 16,
    fontFamily: "Vazir-Medium",
    color: "#333",
    flex: 1,
  },
  selectColorsButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  selectColorsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Vazir-Bold",
  },
  friendsSection: {
    marginBottom: 20,
  },
  friendsCount: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  friendsList: {
    maxHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  friendsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  friendCard: {
    width: "48%",
    flexDirection: "column",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  friendCardRight: {
    marginLeft: "4%",
  },
  rtlFriendCard: {
    alignItems: "flex-end",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  rtlAvatar: {
    alignSelf: "flex-end",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  friendName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  rtlFriendName: {
    textAlign: "right",
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 5,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
