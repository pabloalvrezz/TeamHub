import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
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

import { firebase } from "@react-native-firebase/storage";
import { sendEmailVerification, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Modal } from "react-native-paper";
import { auth } from "./Login";
import { useTranslation } from "react-i18next";
import { I18n } from "i18n-js";
import { changeLanguage } from "i18next";
import i18n from "../i18n.config";
import { useRoute } from "@react-navigation/native";

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(auth.currentUser.displayName);
  const [phoneNumber, setPhoneNumber] = useState(auth.currentUser.phoneNumber);
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const route = useRoute();

  useEffect(() => {
    console.log(auth.currentUser.phoneNumber);
    const fetchUserData = async () => {
      try {
        const db = getFirestore();
        const userRef = collection(db, "users");

        const q = query(userRef, where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          setUserData(doc.data());
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (!userData) {
      fetchUserData();
    }
  }, [userData]);

  // Function to select image from gallery
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
      if (result.assets && result.assets[0].uri) {
        setLoading(true);

        const resolvedImage = await uploadImage(result.assets[0].uri);

        let ref = firebase
          .storage()
          .ref()
          .child("images/profilePictures/" + userData.uid);
        ref
          .put(resolvedImage)
          .then(() => {
            ref.getDownloadURL().then((url) => {
              setUserData((prevUserData) => ({
                ...prevUserData,
                photoURL: url,
              }));

              updateProfilePhoto(url);
            });
            setLoading(false);
          })
          .catch((error) => {
            alert(t("errorUploadingImage"));
          });
      }
    }
  };

  // Function to upload image to firebase storage
  const uploadImage = (uri) => {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve(xhr.response);
        }
      };

      xhr.open("GET", uri);
      xhr.responseType = "blob";
      xhr.send();
    });
  };

  // Function to update profile photo
  const updateProfilePhoto = async (photoURL) => {
    try {
      setLoading(true);
      await updateProfile(auth.currentUser, {
        photoURL: photoURL,
      });
      setLoading(false);

      updateProfileDataBase();
    } catch (error) {
      alert(error);
    }
  };

  // Function to update profile phone number
  const updateProfilePhoneNumber = async (phoneNumber) => {
    console.log(phoneNumber);
    try {
      setLoading(true);

      await updateProfile(auth.currentUser, {
        phoneNumber: phoneNumber,
      });

      setLoading(false);
    } catch (error) {
      alert(error);
    }
  };

  // Function to update the user on the database
  const updateProfileDataBase = async () => {
    try {
      const uid = auth.currentUser.uid;

      const db = getFirestore();
      const userRef = doc(db, "users", uid);

      await updateDoc(
        userRef,
        {
          uid: uid,
          displayName: displayName,
          phoneNumber: phoneNumber,
          photoURL: auth.currentUser.photoURL,
        },
        { merge: true }
      );

      setUserData((prevUserData) => ({
        ...prevUserData,
        displayName: displayName,
        phoneNumber: phoneNumber,
        photoURL: auth.currentUser.photoURL,
      }));
      updateProfilePhoneNumber(phoneNumber);
      Alert.alert(t("profileUpdated"));
    } catch (error) {
      alert(t("errorUpdatingProfile"));
    }
  };

  // Function to open modal to verify email
  const openModal = () => {
    setVisible(true);
  };

  // Function to hide modal
  const hideModal = () => {
    setVisible(false);
  };

  const changeAppLanguage = (lng) => {
    changeLanguage(lng);

    navigation.navigate("Profile");
  };

  const logOut = async () => {
    await AsyncStorage.removeItem("isLoggedIn");
    await AsyncStorage.removeItem("userData");
    await AsyncStorage.removeItem("searchHistory");
    await auth.signOut();
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t("profile")}</Text>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => changeAppLanguage(i18n.language === "en" ? "es" : "en")}
      >
        {i18n.language === "en" ? (
          <Image
            source={require("../assets/inglaterra.png")}
            style={styles.languageButtonFlag}
          />
        ) : (
          <Image
            source={require("../assets/espana.png")}
            style={styles.languageButtonFlag}
          />
        )}
      </TouchableOpacity>
      <View style={styles.profilePhotoContainer}>
        {userData?.photoURL ? (
          <Image
            source={{ uri: userData.photoURL }}
            style={styles.profilePhoto}
          />
        ) : (
          <FontAwesome5
            name="user-circle"
            size={120}
            color="grey"
            style={styles.profilePhoto}
          />
        )}

        <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
          <FontAwesome5 name="plus" size={13} color="#fff" />
        </TouchableOpacity>
        {auth.currentUser.emailVerified ? (
          <View style={styles.verifiedStatus}></View>
        ) : (
          <TouchableOpacity onPress={openModal}>
            <View style={styles.unverifiedStatus}></View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity onPress={logOut}>
          <FontAwesome5 name="sign-out-alt" size={30} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.inputField}>
          <TextInput
            placeholder={t("username")}
            style={styles.input}
            autoCapitalize="none"
            value={displayName}
            onChangeText={(displayName) => setDisplayName(displayName)}
          />
        </View>
        <View style={styles.inputField}>
          <TextInput
            placeholder={t("phoneNumber")}
            style={styles.input}
            keyboardType="phone-pad"
            autoCapitalize="none"
            value={userData?.phoneNumber}
            onChangeText={(phoneNumber) => setPhoneNumber(phoneNumber)}
          />
        </View>
        <View style={styles.buttonBox}>
          {loading ? (
            <ActivityIndicator color="#00b4d8" />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setLoading(true);

                setTimeout(() => {
                  updateProfilePhoto(userData.photoURL);
                }, 500);

                updateProfile(auth.currentUser, {
                  displayName: displayName,
                  phoneNumber: phoneNumber,
                });
                setLoading(false);
              }}
            >
              <Text style={styles.buttonText}>{t("save")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.modal}
      >
        <Text>{t("verifyEmail")}</Text>
        <TouchableOpacity
          style={styles.buttonEmail}
          onPress={() => {
            sendEmailVerification(auth.currentUser);
            hideModal();
            alert(t("verifyEmailSent"));
          }}
        >
          <Text style={styles.buttonEmailText}>{t("verifyEmailSent")}</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profilePhotoContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  uploadButton: {
    position: "absolute",
    right: 10,
    bottom: 0,
    borderRadius: 15,
    padding: 5,
    backgroundColor: "#00b4d8",
  },
  modal: {
    backgroundColor: "rgba(255,255, 255, 0.7)",
    padding: 20,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
  },
  buttonEmail: {
    backgroundColor: "#00b4d8",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonEmailText: {
    color: "#fff",
    fontSize: 14,
  },
  verifiedStatus: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 23,
    width: 23,
    borderRadius: 100,
    padding: 5,
    backgroundColor: "green",
  },
  unverifiedStatus: {
    position: "absolute",
    left: 0,
    top: -120,
    height: 23,
    width: 23,
    borderRadius: 100,
    padding: 5,
    backgroundColor: "red",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "100%",
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
    paddingVertical: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginVertical: 10,
  },
  input: {
    paddingHorizontal: 15,
    fontSize: 16,
  },
  buttonBox: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#00b4d8",
    fontWeight: "bold",
    borderRadius: 30,
    paddingVertical: 15,
    width: "90%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  logoutButtonContainer: {
    position: "absolute",
    left: 10,
    top: 10,
    padding: 10,
    borderRadius: 10,
  },
  languageButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 10,
    borderRadius: 10,
  },
  languageButtonFlag: {
    width: 30,
    height: 30,
  },
});
