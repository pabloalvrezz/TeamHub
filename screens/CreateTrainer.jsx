import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import appFirebase from "../credencials";
import { firebase } from "@react-native-firebase/storage";
import {
  collection,
  doc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export default function CreateTrainer() {
  const [name, setName] = useState("");
  const [firstSurname, setFirstSurname] = useState("");
  const [middleSurname, setMiddleSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthdate, setBirthdate] = useState(
    new Date(
      new Date().getFullYear() - 18,
      new Date().getMonth(),
      new Date().getDate()
    )
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [touchedName, setTouchedName] = useState(false);
  const [touchedFirstSurname, setTouchedFirstSurname] = useState(false);
  const [touchedMiddleSurname, setTouchedMiddleSurname] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPhoneNumber, setTouchedPhoneNumber] = useState(false);
  const { t } = useTranslation();
  const auth = getAuth(appFirebase);
  const [loading, setLoading] = useState(false);

  // Function to select an image from the gallery
  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert(t("cameraPermission"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result && !result.cancelled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Function to handle the date change
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthdate;
    setShowDatePicker(false);
    setBirthdate(currentDate);
  };

  // Function to create a new trainer
  const createTrainer = async () => {
    if (
      name.trim() === "" ||
      firstSurname.trim() === "" ||
      middleSurname.trim() === "" ||
      email.trim() === "" ||
      !validateEmail(email) ||
      phoneNumber.trim() === "" ||
      birthdate >=
        new Date(
          new Date().getFullYear() - 18,
          new Date().getMonth(),
          new Date().getDate() + 1
        ) ||
      profileImage === null
    ) {
      if (!validateEmail(email)) {
        Alert.alert(t("alert"), t("emailFormat"));
      } else {
        Alert.alert(t("alert"), t("trainerAlert"));
      }
      return;
    }

    setLoading(true);

    const username =
      name.charAt(0) + firstSurname.trim() + middleSurname.trim();

    const password = generatePassword();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: username,
      });

      const downloadURL = await uploadProfileImage(
        profileImage,
        userCredential
      );

      const db = getFirestore();
      const trainerRef = collection(db, "users");

      await setDoc(doc(trainerRef, userCredential.user.uid), {
        birthdate: birthdate,
        displayName: username,
        email: email,
        firstSurname: firstSurname.trim(),
        middleSurname: middleSurname.trim(),
        name: name.trim(),
        phoneNumber: phoneNumber,
        photoURL: downloadURL,
        role: "trainer",
        uid: userCredential.user.uid,
      });

      Alert.alert(t("success"), t("trainerCreated"));

      setName("");
      setFirstSurname("");
      setMiddleSurname("");
      setEmail("");
      setPhoneNumber("");
      setBirthdate(
        new Date(
          new Date().getFullYear() - 18,
          new Date().getMonth(),
          new Date().getDate()
        )
      );
      setProfileImage(null);

      setLoading(false);
    } catch (error) {
      Alert.alert(t("error"), error.message);
    }
  };

  // Function to validate the email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to generate a random password
  const generatePassword = () => {
    const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialCharacters = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let password = "";

    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * uppercaseLetters.length);
      password += uppercaseLetters[randomIndex];
    }

    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * lowercaseLetters.length);
      password += lowercaseLetters[randomIndex];
    }

    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      password += numbers[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * specialCharacters.length);
    password += specialCharacters[randomIndex];

    password = shuffleString(password);

    return password;
  };

  // Function to shuffle a string
  const shuffleString = (str) => {
    let shuffledString = str.split("");
    for (let i = shuffledString.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledString[i], shuffledString[j]] = [
        shuffledString[j],
        shuffledString[i],
      ];
    }
    return shuffledString.join("");
  };

  // Function to upload the profile image
  const uploadProfileImage = async (uri, userCredential) => {
    try {
      const resolvedImage = await fetch(uri);
      const blob = await resolvedImage.blob();
      const ref = firebase
        .storage()
        .ref()
        .child("images/profilePictures/" + userCredential.user.uid);
      await ref.put(blob);
      return await ref.getDownloadURL();
    } catch (error) {
      throw new Error("Error uploading image: " + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.inner}>
        <View style={styles.inputContainer}>
          <Text>{t("namePlaceHolder")}:</Text>
          <TextInput
            style={[
              styles.input,
              touchedName && name.trim() === "" && styles.inputError,
            ]}
            value={name}
            onChangeText={setName}
            placeholder={t("namePlaceHolder")}
            onBlur={() => setTouchedName(true)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text>{t("firstSurnamePlaceHolder")}:</Text>
          <TextInput
            style={[
              styles.input,
              touchedFirstSurname &&
                firstSurname.trim() === "" &&
                styles.inputError,
            ]}
            value={firstSurname}
            onChangeText={setFirstSurname}
            placeholder={t("firstSurnamePlaceHolder")}
            onBlur={() => setTouchedFirstSurname(true)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text>{t("middleSurnamePlaceHolder")}:</Text>
          <TextInput
            style={[
              styles.input,
              touchedMiddleSurname &&
                middleSurname.trim() === "" &&
                styles.inputError,
            ]}
            value={middleSurname}
            onChangeText={setMiddleSurname}
            placeholder={t("middleSurnamePlaceHolder")}
            onBlur={() => setTouchedMiddleSurname(true)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text>{t("emailPlaceholder")}:</Text>
          <TextInput
            style={[
              styles.input,
              touchedEmail && email.trim() === "" && styles.inputError,
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder={t("emailPlaceholder")}
            keyboardType="email-address"
            onBlur={() => setTouchedEmail(true)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text>{t("phoneNumberPlaceHolder")}:</Text>
          <TextInput
            style={[
              styles.input,
              touchedPhoneNumber &&
                phoneNumber.trim() === "" &&
                styles.inputError,
            ]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder={t("phoneNumberPlaceHolder")}
            keyboardType="phone-pad"
            dataDetectorTypes={"phoneNumber"}
            maxLength={9}
            onBlur={() => setTouchedPhoneNumber(true)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text>{t("birthdatePlaceHolder")}:</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>
              {birthdate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthdate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text>{t("profileImagePlaceHolder")}:</Text>
          <TouchableOpacity onPress={selectImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.image} />
            ) : (
              <FontAwesome name="image" size={50} color="black" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={createTrainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t("createNewTrainer")}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inner: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  inputError: {
    borderColor: "red",
  },
  dateText: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 5,
    lineHeight: 40,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#00b4d8",
    borderRadius: 30,
    paddingVertical: 20,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
