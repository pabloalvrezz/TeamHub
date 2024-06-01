import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function SearchedUser({ route, navigation }) {
  const user = route.params.user;
  const { t } = useTranslation();

  useEffect(() => {
    if (user && user.displayName) {
      navigation.setOptions({ title: user.displayName });
    }
  }, [user]);

  const fullName = `${user?.name} ${user?.firstSurname} ${user?.middleSurname}`;

  return (
    <View style={styles.container}>
      <View style={styles.profilePhoto}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.image} />
        ) : (
          <FontAwesome5 name="user-circle" size={100} color="grey" />
        )}
      </View>
      <Animated.View entering={FadeIn.delay(200)} style={styles.userData}>
        <Text style={styles.emailText}>{user?.email}</Text>
        <Text style={styles.fullNameText}>{fullName}</Text>
      </Animated.View>
      <TouchableOpacity style={styles.sendMessageButton}>
        <Text style={styles.sendMessageButtonText}>{t("sendMessage")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  profilePhoto: {
    alignItems: "center",
    marginTop: "10%",
  },
  image: {
    width: 110,
    height: 100,
    borderRadius: 100,
  },
  userData: {
    marginTop: 20,
    alignItems: "center",
  },
  emailText: {
    fontSize: 16,
  },
  fullNameText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  sendMessageButton: {
    backgroundColor: "#00b4d8",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
    width: "90%",
  },
  sendMessageButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
