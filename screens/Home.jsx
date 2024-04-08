import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import appFirebase from "../credencials";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./Login";
import { FontAwesome5 } from "@expo/vector-icons"; // Importa el icono de FontAwesome5

export default function Home({ navigation }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Estado para almacenar la consulta de búsqueda

  useEffect(() => {
    const checkLoggedIn = async () => {
      const userData = await AsyncStorage.getItem("userData");

      if (userData) {
        setUserData(JSON.parse(userData)); // Parse the string to object
      }

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
    auth.signOut();

    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text>Home</Text>
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
  searchContainer: {
    position: "absolute",
    top: "10%",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    width: "90%",
    marginHorizontal: "5%",
    zIndex: 1,
    backgroundColor: "#ffffff",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
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
