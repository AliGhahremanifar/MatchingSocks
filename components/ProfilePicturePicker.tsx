import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { pickImage, takePhoto } from "../utils/storage";

interface ProfilePicturePickerProps {
  currentPicture?: string | null;
  onPictureSelected: (pictureUri: string) => void;
  size?: number;
  showEditButton?: boolean;
}

export default function ProfilePicturePicker({
  currentPicture,
  onPictureSelected,
  size = 80,
  showEditButton = true,
}: ProfilePicturePickerProps) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const handlePickImage = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      onPictureSelected(imageUri);
      setShowModal(false);
    }
  };

  const handleTakePhoto = async () => {
    const imageUri = await takePhoto();
    if (imageUri) {
      onPictureSelected(imageUri);
      setShowModal(false);
    }
  };

  const handleRemovePicture = () => {
    Alert.alert(
      t("settings.removePictureTitle"),
      t("settings.removePictureMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.remove"),
          style: "destructive",
          onPress: () => {
            onPictureSelected("");
            setShowModal(false);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.pictureContainer, { width: size, height: size }]}
        onPress={() => showEditButton && setShowModal(true)}
        disabled={!showEditButton}
      >
        {currentPicture ? (
          <Image source={{ uri: currentPicture }} style={styles.picture} />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size }]}>
            <Ionicons name="person" size={size * 0.4} color="#8E8E93" />
          </View>
        )}
        {showEditButton && (
          <View style={styles.editButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("settings.chooseProfilePicture")}
            </Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>
                {t("settings.takePhoto")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handlePickImage}
            >
              <Ionicons name="images" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>
                {t("settings.chooseFromLibrary")}
              </Text>
            </TouchableOpacity>

            {currentPicture && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleRemovePicture}
              >
                <Ionicons name="trash" size={24} color="#FF3B30" />
                <Text style={[styles.modalOptionText, styles.removeText]}>
                  {t("settings.removePicture")}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  pictureContainer: {
    borderRadius: 50,
    overflow: "hidden",
    position: "relative",
  },
  picture: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: "#F2F2F7",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#007AFF",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
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
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Vazir-Bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: "Vazir-Medium",
    color: "#333",
    marginLeft: 15,
  },
  removeText: {
    color: "#FF3B30",
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Vazir-Bold",
    color: "#333",
  },
});
