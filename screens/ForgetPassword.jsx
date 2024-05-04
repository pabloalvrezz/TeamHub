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
  signInWithEmailAndPassword,
} from "firebase/auth";
import appFirebase from "../credencials";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

const auth = getAuth(appFirebase);

const ResetPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");

  // Function to reset password
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Email is required");
      return;
    }

    const db = getFirestore();
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    console.log(querySnapshot.docs);

    if (querySnapshot.empty) {
      Alert.alert("Email not found");
      return;
    } else {
      try {
        await sendPasswordResetEmail(auth, email);
        Alert.alert(t("alert"), t("passwordResetEmailSent"));
        navigation.navigate("Login");
      } catch (error) {
        Alert.alert(t("alert"), t("errorSendingEmail"));
      }
    }
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
