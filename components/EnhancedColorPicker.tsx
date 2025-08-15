import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useLanguage } from "../hooks/useLanguage";
import { SockColor } from "../types";
import {
  DEFAULT_COLORS,
  EXTENDED_COLORS,
  getTranslatedColorName,
} from "../utils/storage";

interface EnhancedColorPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedColors: SockColor[];
  onColorToggle: (color: SockColor) => void;
  onCustomColorAdd: (hexCode: string, colorName: string) => void;
}

export default function EnhancedColorPicker({
  visible,
  onClose,
  selectedColors,
  onColorToggle,
  onCustomColorAdd,
}: EnhancedColorPickerProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [showExtended, setShowExtended] = useState(false);
  const [customColor, setCustomColor] = useState("");
  const [customColorName, setCustomColorName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const validateHexColor = (hex: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  };

  const handleCustomColorAdd = () => {
    if (!customColor.trim()) {
      Alert.alert(t("common.error"), t("settings.enterValidColor"));
      return;
    }

    if (!customColorName.trim()) {
      Alert.alert(t("common.error"), t("settings.enterColorName"));
      return;
    }

    const hexCode = customColor.startsWith("#")
      ? customColor
      : `#${customColor}`;

    if (!validateHexColor(hexCode)) {
      Alert.alert(t("common.error"), t("settings.invalidColorFormat"));
      return;
    }

    const newColor: SockColor = {
      id: `custom-${Date.now()}`,
      name: customColorName.trim(),
      hexCode,
      isDefault: false,
    };

    onCustomColorAdd(hexCode, customColorName.trim());
    setCustomColor("");
    setCustomColorName("");
    setShowCustomInput(false);
  };

  const renderColorItem = (color: SockColor) => {
    const isSelected = selectedColors.some((c) => c.id === color.id);
    return (
      <TouchableOpacity
        key={color.id}
        style={[styles.colorPickerItem, isRTL && styles.rtlColorPickerItem]}
        onPress={() => onColorToggle(color)}
      >
        <View
          style={[
            styles.colorPickerCircle,
            { backgroundColor: color.hexCode },
            isSelected && styles.selectedColorCircle,
          ]}
        />
        <Text
          style={[styles.colorPickerName, isRTL && styles.rtlColorPickerName]}
        >
          {getTranslatedColorName(color.name, t)}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={20} color="#007AFF" />}
      </TouchableOpacity>
    );
  };

  const renderCustomColorInput = () => (
    <View style={styles.customColorSection}>
      <Text style={[styles.sectionTitle, isRTL && styles.rtlSectionTitle]}>
        {t("settings.customColor")}
      </Text>
      <View style={styles.customColorInput}>
        <TextInput
          style={[styles.nameInput, isRTL && styles.rtlNameInput]}
          placeholder={t("settings.enterColorName")}
          value={customColorName}
          onChangeText={setCustomColorName}
          textAlign={isRTL ? "right" : "left"}
        />
        <TextInput
          style={[styles.hexInput, isRTL && styles.rtlHexInput]}
          placeholder={t("settings.enterHexColor")}
          value={customColor}
          onChangeText={setCustomColor}
          maxLength={7}
          autoCapitalize="characters"
          textAlign={isRTL ? "right" : "left"}
        />
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={handleCustomColorAdd}
        >
          <Text style={styles.addCustomButtonText}>{t("common.add")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, isRTL && styles.rtlModalTitle]}>
            {t("settings.selectSockColors")}
          </Text>

          <ScrollView style={styles.colorPickerList}>
            {/* Default Colors */}
            <Text
              style={[styles.sectionTitle, isRTL && styles.rtlSectionTitle]}
            >
              {t("settings.basicColors")}
            </Text>
            {DEFAULT_COLORS.map(renderColorItem)}

            {/* Extended Colors */}
            {showExtended && (
              <>
                <Text
                  style={[styles.sectionTitle, isRTL && styles.rtlSectionTitle]}
                >
                  {t("settings.moreColors")}
                </Text>
                {EXTENDED_COLORS.map(renderColorItem)}
              </>
            )}

            {/* Custom Colors */}
            {selectedColors.filter((color) => !color.isDefault).length > 0 && (
              <>
                <Text
                  style={[styles.sectionTitle, isRTL && styles.rtlSectionTitle]}
                >
                  {t("settings.customColors")}
                </Text>
                {selectedColors
                  .filter((color) => !color.isDefault)
                  .map(renderColorItem)}
              </>
            )}

            {/* Custom Color Input */}
            {showCustomInput && renderCustomColorInput()}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowExtended(!showExtended)}
              >
                <Ionicons
                  name={showExtended ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#007AFF"
                />
                <Text style={styles.actionButtonText}>
                  {showExtended
                    ? t("settings.showLess")
                    : t("settings.seeMore")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowCustomInput(!showCustomInput)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#34C759" />
                <Text style={[styles.actionButtonText, { color: "#34C759" }]}>
                  {t("settings.addCustomColor")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>{t("common.done")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  rtlModalTitle: {
    textAlign: "right",
    fontFamily: "Vazir-Bold",
  },
  colorPickerList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  rtlSectionTitle: {
    textAlign: "right",
    fontFamily: "Vazir-Medium",
  },
  colorPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  rtlColorPickerItem: {
    flexDirection: "row-reverse",
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
    color: "#333",
  },
  rtlColorPickerName: {
    textAlign: "right",
    fontFamily: "Vazir-Medium",
    paddingRight: 5,
  },
  actionButtons: {
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#007AFF",
    fontFamily: "Vazir-Medium",
  },
  customColorSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  customColorInput: {
    flexDirection: "column",
    gap: 10,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  rtlNameInput: {
    textAlign: "right",
  },
  hexInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  rtlHexInput: {
    textAlign: "right",
  },
  addCustomButton: {
    backgroundColor: "#34C759",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  addCustomButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Vazir-Bold",
  },
});
