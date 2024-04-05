import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import appFirebase from "../credencials";
import AsyncStorage from "@react-native-async-storage/async-storage";

const auth = getAuth(appFirebase);

export default function Home({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      if (!isLoggedIn) {
        navigation.navigate("Login");
      }
    };
    checkLoggedIn();

    // Use onAuthStateChanged to listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });

    return () => unsubscribe(); // Cleanup function
  }, []);

  // Function to log out
  const logOut = async () => {
    await AsyncStorage.removeItem("isLoggedIn");
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      {/* Display user's information */}
      {user && (
        <View>
         
          <TouchableOpacity onPress={logOut} style={styles.button}>
            <Text style={{ color: "#fff" }}>Log out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#00b4d8",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 18,
    marginBottom: 5,
  },
});
