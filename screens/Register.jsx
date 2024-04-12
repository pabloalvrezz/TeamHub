import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import appFirebase from "../credencials";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from "firebase/firestore";

const strengthLabels = ["weak", "medium", "strong"];
const auth = getAuth(appFirebase);

const Register = (props) => {
  // States
  const [strength, setStrength] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);

  // Const to toggle password visibility
  const togglePasswordVisibility1 = () => {
    setShowPassword1(!showPassword1);
  };

  // Const to toggle password visibility
  const togglePasswordVisibility2 = () => {
    setShowPassword2(!showPassword2);
  };

  // Const to navigate to login screen
  const loginAccount = () => {
    props.navigation.navigate("Login");
  };

  // Const to check email
  const checkEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Const to create account
  const createAccount = async () => {
    equlaPasswords = false;
    weakPassword = true;
    error = "Error creating account";

    // Check if the username is empty
    if (username === "") {
      error = "Username is empty";
    }

    // Check if the passwords are equal
    if (password !== repeatPassword) {
      error = "Passwords do not match";
    } else equlaPasswords = true;

    // Check the strength of the password
    if (strength !== "weak") {
      weakPassword = false;
    } else {
      error = "Weak password";
    }

    // Check if the email is correct
    if (!checkEmail(email)) {
      error = "Email format is incorrect";
    }

    // Check all the conditions
    if (equlaPasswords && !weakPassword && checkEmail(email)) {
      setLoading(true); // Set the loading state to true when the account creation process starts

      await AsyncStorage.setItem("isLoggedIn", "true");

      try {
        // Create a new user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Update the user's profile
        await updateProfile(userCredential.user, {
          displayName: username,
        });

        // Save the user data to Firestore
        const db = getFirestore();
        const usersRef = collection(db, "users");

        const userID = userCredential.user.uid;

        await setDoc(doc(usersRef, userID), {
          uid: userID,
          displayName: username,
          email: email,
          photoURL: "",
        });

        setLoading(false);

        // Save the isLoggedIn key to true in AsyncStorage
        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(userCredential.user)
        );

        props.navigation.navigate("App");
      } catch (error) {
        setLoading(false);

        if (error.code === "auth/email-already-in-use") {
          Alert.alert(
            "Error",
            "The email address is already in use by another account.",
            [
              {
                text: "Ok",
                style: "cancel",
              },
              {
                text: "Forget Password?",
                onPress: () => props.navigation.navigate("ForgetPassword"),
                style: "cancel",
              },
            ]
          );
        } else {
          // Handle other errors
          console.error("Error creating account:", error);
          alert("Error creating account");
        }
      }
    } else {
      alert(error);
    }
  };

  /**
   * Check the strength of the password
   * @param {*} password
   */
  const getStrength = (password) => {
    let strengthIndicator = -1;
    let upper = false,
      lower = false,
      numbers = false,
      special = false;

    for (let index = 0; index < password.length; index++) {
      let char = password.charCodeAt(index);

      // Uppercase characters
      if (!upper && char >= 65 && char <= 90) {
        upper = true;
        strengthIndicator++;
      }

      // Numbers
      if (!numbers && char >= 48 && char <= 57) {
        numbers = true;
        strengthIndicator++;
      }

      // Lowercase characters
      if (!lower && char >= 97 && char <= 122) {
        lower = true;
        strengthIndicator++;
      }

      // Special characters
      if (
        !special &&
        ((char >= 33 && char <= 47) ||
          (char >= 58 && char <= 64) ||
          (char >= 91 && char <= 96) ||
          (char >= 123 && char <= 126))
      ) {
        special = true;
        strengthIndicator++;
      }
    }

    setStrength(strengthLabels[strengthIndicator] ?? "");
  };

  const handleChange = (password) => {
    getStrength(password);
    setPassword(password);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/HelmetLogo.webp")}
        style={styles.profile}
      />

      <View style={styles.card}>
        <View style={styles.inputField}>
          <TextInput
            placeholder="User"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(username) => setUserName(username)}
          />
          <View style={styles.inputFieldIcon}>
            <FontAwesome5 name="user" size={20} color="grey" />
          </View>
        </View>

        <View style={styles.inputField}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(email) => setEmail(email)}
          />
          <View style={styles.inputFieldIcon}>
            <FontAwesome5 name="envelope" size={20} color="grey" />
          </View>
        </View>

        <View style={styles.inputField}>
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={!showPassword1}
            onChangeText={(password) => {
              handleChange(password), setPassword(password);
            }}
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

        <View style={styles.inputField}>
          <TextInput
            placeholder="Repeat Password"
            style={styles.input}
            secureTextEntry={!showPassword2}
            onChangeText={(repeatPassword) => setRepeatPassword(repeatPassword)}
          />
          <TouchableOpacity
            style={styles.inputFieldIcon}
            onPress={togglePasswordVisibility2}
          >
            <FontAwesome5
              name={showPassword2 ? "eye" : "eye-slash"}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.bars, styles[strength]]}>
          <View style={styles.bar}></View>
        </View>
        <Text style={styles.strength}>
          {strength && `${strength} password`}
        </Text>

        <View style={styles.buttonBox}>
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={createAccount}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.separator}></View>

        <View style={styles.registerBox}>
          <Text>Do you already have one? </Text>
          <TouchableOpacity onPress={loginAccount}>
            <Text style={{ color: "#00b4d8" }}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    flexDirection: "row",
    justifyContent: "center",
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
  bars: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#dfe1f0",
  },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    transition: "width 0.4s",
    width: 0,
  },
  strength: {
    textAlign: "left",
    height: 30,
    textTransform: "capitalize",
    color: "#868b94",
  },
  weak: {
    backgroundColor: "#e24c71",
    width: "33%",
  },
  medium: {
    backgroundColor: "#f39845",
    width: "66%",
  },
  strong: {
    backgroundColor: "#57c558",
  },
});

export default Register;
