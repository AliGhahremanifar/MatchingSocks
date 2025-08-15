import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLanguage } from "../hooks/useLanguage";
import { Text, View } from "./Themed";

interface AdBannerProps {
  onClose?: () => void;
  streakDays?: number;
}

export default function AdBanner({ onClose, streakDays = 0 }: AdBannerProps) {
  const { isRTL } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  const handleAdPress = async () => {
    try {
      const url = "https://www.sovin.ir";
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open the website");
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Scrolling animation effect
  useEffect(() => {
    const animate = () => {
      setScrollPosition((prev) => {
        const newPosition = prev - 1;
        // Reset position when content has scrolled completely
        if (newPosition < -400) {
          return 0;
        }
        return newPosition;
      });
    };

    animationRef.current = setInterval(animate, 50); // Adjust speed here

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // Only show ad when streak is a multiple of 3
  const shouldShowAd = streakDays > 0 && streakDays % 3 === 0;

  if (!isVisible || !shouldShowAd) {
    return null;
  }

  return (
    <View style={[styles.container, isRTL && styles.rtlContainer]}>
      <View style={styles.tickerContainer}>
        <View style={styles.tickerContent}>
          <Ionicons name="megaphone-outline" size={16} color="#FF6B35" />
          <View style={styles.scrollingContentContainer}>
            <View
              style={[
                styles.scrollingContent,
                { transform: [{ translateX: scrollPosition }] },
              ]}
            >
              {/* Repeat the logo multiple times for continuous scrolling */}
              {[...Array(8)].map((_, index) => (
                <View key={index} style={styles.logoContainer}>
                  <Image
                    source={require("../assets/images/sovinlogo1025.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.logoText}>www.sovin.ir</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.adContent}
          onPress={handleAdPress}
          activeOpacity={0.8}
        >
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>AD</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={16} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9F0",
    borderBottomWidth: 1,
    borderBottomColor: "#FFE4CC",
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 50,
  },
  rtlContainer: {
    flexDirection: "row-reverse",
  },
  tickerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF9F0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#FFE4CC",
    overflow: "hidden",
  },
  tickerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  scrollingContentContainer: {
    flex: 1,
    overflow: "hidden",
    marginLeft: 8,
  },
  scrollingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  logoImage: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  logoText: {
    fontSize: 14,
    fontFamily: "Vazir-Medium",
    color: "#FF6B35",
    textDecorationLine: "underline",
  },
  adContent: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adBadge: {
    backgroundColor: "#FF6B35",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adBadgeText: {
    fontSize: 10,
    fontFamily: "Vazir-Bold",
    color: "#FFFFFF",
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
  },
});
