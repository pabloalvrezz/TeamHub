import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import appFirebase from "../credencials";
import { globalStyle } from "./globalStyles/styles";

export const auth = getAuth(appFirebase);

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility1 = () => {
    setShowPassword1(!showPassword1);
  };

  const createAccount = () => {
    props.navigation.navigate("Register");
  };

  // Function to log in
  const login = async () => {
    try {
      setLoading(true); // Set the loading state to true when the login process starts
      await signInWithEmailAndPassword(auth, email, password);

      setEmail("");
      setPassword("");

      setLoading(false); // Set the loading state to false when the login process ends

      await AsyncStorage.setItem("isLoggedIn", "true"); // Set the isLoggedIn key to true in AsyncStorage
      await AsyncStorage.setItem("userData", JSON.stringify(auth.currentUser));

      props.navigation.navigate("App");
    } catch (error) {
      setLoading(false); // Set the loading state to false when the login process ends
      let errorMessage = "Login error";

      switch (error.code) {
        case "auth/user-not-found":
        case "auth/invalid-email":
          errorMessage = "Incorrect email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid credentials";
          break;
        default:
          errorMessage = "Login error!";
          break;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.imgContainer}>
      <View>
        <Image
          source={require("../assets/HelmetLogo.webp")}
          style={styles.profile}
        />
      </View>

      <View style={styles.card}>
        <View style={globalStyle.inputField}>
          <TextInput
            name="txtEmail"
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(email) => setEmail(email)}
          />
          <View style={styles.inputFieldIcon}>
            <FontAwesome5 name="envelope" size={20} color="grey" />
          </View>
        </View>

        <View style={styles.inputField}>
          <TextInput
            name="txtPassword"
            placeholder="Password"
            style={styles.input}
            secureTextEntry={!showPassword1}
            value={password}
            onChangeText={(password) => setPassword(password)}
          />
          <TouchableOpacity
            style={styles.inputFieldIcon}
            onPress={togglePasswordVisibility1}
          >
            <FontAwesome5
              name={showPassword1 ? "eye" : "eye-slash"}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonBox}>
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={login}>
              <Text style={styles.buttonText}>Log in</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.separator}></View>

        <View style={styles.registerBox}>
          <Text>Or create one </Text>
          <TouchableOpacity onPress={createAccount}>
            <Text style={{ color: "#00b4d8" }}>here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imgContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  profile: {
    width: 120,
    height: 120,
    borderRadius: 50,
  },

  card: {
    margin: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "90%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.96,
    elevation: 5,
  },
  inputField: {
    paddingVertical: 20,
    backgroundColor: "#cccccc",
    borderRadius: 30,
    marginVertical: 10,
  },
  inputFieldIcon: {
    position: "absolute",
    right: 20,
    top: "80%",
  },
  input: {
    paddingHorizontal: 15,
  },
  buttonBox: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#00b4d8",
    fontWeight: "bold",
    borderRadius: 30,
    paddingVertical: 20,
    width: "90%",
    marginTop: 20,
  },

  buttonText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#6c757d",
    marginVertical: 10,
  },

  registerBox: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
