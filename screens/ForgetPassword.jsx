import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import {
  getAuth,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import appFirebase from "../credencials";

const auth = getAuth(appFirebase);

const ResetPassword = () => {
  const [email, setEmail] = useState("");

  // Function to reset password
  const handleResetPassword = () => {
    if (!email) {
      Alert.alert("Email is required");
      return;
    }

    // Check if the email is associated with an existing account
    fetchSignInMethodsForEmail(auth, email)
      .then((signInMethods) => {
        if (signInMethods.length === 0) {
          // Email is not associated with any account
          Alert.alert("Email is not associated with any account");
        } else {
          // Email is associated with an existing account, send password reset email
          sendPasswordResetEmail(appFirebase, email)
            .then(() => {
              Alert.alert("Password reset email sent");
            })
            .catch((error) => {
              Alert.alert(error.message);
            });
        }
      })
      .catch((error) => {
        Alert.alert("Error checking email:", error.message);
      });
  };

  return (
    <View style={styles.container}>
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
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(email) => setEmail(email)}
          />
        </View>

        <View style={styles.buttonBox}>
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
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
});

export default ResetPassword;
