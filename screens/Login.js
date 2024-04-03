import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import appFirebase from "../credencials";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth(appFirebase);

export default function Login(props) {
  // Create the state variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Create the login function
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      Alert.alert("Sign in...", "You are signed in!");

      props.navigation.navigate("Home");
    } catch (error) {
      console.log(error);
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
        <View style={styles.inputField}>
          <TextInput
            placeholder="Email"
            style={{ paddingHorizontal: 15 }}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(email) => setEmail(email)}
          />
        </View>

        <View style={styles.inputField}>
          <TextInput
            placeholder="Password"
            style={{ paddingHorizontal: 15 }}
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
        </View>

        <View style={styles.buttonBox}>
          <TouchableOpacity style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imgContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#11435B",
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
  buttonBox: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#f2aa1f",
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
    borderBottomColor: "gray",
    marginVertical: 10,
  },
});
