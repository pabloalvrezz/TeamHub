import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { firebase } from "@react-native-firebase/storage";
import { sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "./Login";
import { Modal } from "react-native-paper";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(auth.currentUser.displayName);
  const [email, setEmail] = useState(auth.currentUser.email);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
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
      alert("Permission to access camera roll is required!");
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
            alert("Error uploading image");
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

  // Function to update profile email
  const updateProfileEmail = async (email) => {
    try {
      setLoading(true);

      await updateProfile(auth.currentUser, {
        email: email,
      });

      await auth.currentUser.sendEmailVerification();

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
          email: email,
          photoURL: auth.currentUser.photoURL,
        },
        { merge: true }
      );

      setUserData((prevUserData) => ({
        ...prevUserData,
        displayName: displayName,
        email: email,
        photoURL: auth.currentUser.photoURL,
      }));
    } catch (error) {
      alert("Error updating user profile in Firestore:");
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

  return (
    <View style={styles.container}>
      <View style={styles.profilePhoto}>
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

      <View style={styles.card}>
        <View style={styles.inputField}>
          <TextInput
            placeholder="User"
            style={styles.input}
            autoCapitalize="none"
            value={displayName}
            onChangeText={(displayName) => setDisplayName(displayName)}
          />
        </View>
        <View style={styles.inputField}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(email) => setEmail(email)}
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

                // Wait 0.5 seconds before saving profile
                setTimeout(() => {
                  saveProfile(userData.photoURL);
                }, 500);

                updateProfile(auth.currentUser, {
                  displayName: displayName,
                  email: email,
                });
                setLoading(false);
              }}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.modal}
      >
        <Text>Verified email to change the status</Text>
        <TouchableOpacity
          style={styles.buttonEmail}
          onPress={() => {
            sendEmailVerification(auth.currentUser);
            hideModal();
            alert("Email verification sent");
          }}
        >
          1<Text style={styles.buttonEmailText}>Send Email Verification</Text>
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
    backgroundColor: "#ffffff",
  },

  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 100,
  },

  uploadButton: {
    position: "absolute",
    right: 10,
    bottom: 0,
    borderRadius: 100,
    padding: 5,
    backgroundColor: "#00b4d8",
  },

  modal: {
    position: "absolute",
    backgroundColor: "rgba(255,255, 255, 0.7)",
    padding: 20,
    borderRadius: 30,
    left: "25%",
    width: "50%",
    height: "20%",
    justifyContent: "center",
  },

  buttonEmail: {
    backgroundColor: "#00b4d8",
    padding: 10,
    borderRadius: 5,
    borderRadius: 5,
    marginTop: 10,
  },

  buttonEmailText: {
    color: "#fff",
    fontSize: 10,
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

  registerBox: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
