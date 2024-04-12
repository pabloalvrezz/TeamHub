import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SearchedUser({ route, navigation }) {
  const user = route.params.user;

  useEffect(() => {
    if (user && user.displayName) {
      navigation.setOptions({ title: user.displayName });
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.userStyles}>
        <View style={styles.profilePhoto}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.image} />
          ) : (
            <FontAwesome5 name="user-circle" size={100} color="grey" />
          )}
        </View>
        <View style={styles.userData}>
          <Text>{user?.displayName}</Text>
          <Text numberOfLines={1} ellipsizeMode="tail">
            {user?.email}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.sendMessageButton}>
        <Text>Send message</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingLeft: "3%",
    paddingTop: "3%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  userStyles: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userData: {
    marginLeft: 10,
    flex: 1,
  },
  sendMessageButton: {
    backgroundColor: "#00b4d8",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginLeft: "4%",
    alignItems: "center",
    width: "90%",
  },
});
