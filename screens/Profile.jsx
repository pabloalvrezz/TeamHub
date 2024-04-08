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
import { updateProfile } from "firebase/auth";
import { auth } from "./Login";

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(auth.currentUser.displayName);
  const [email, setEmail] = useState(auth.currentUser.email);

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
              saveProfile(url);
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

  const saveProfile = async (photoURL) => {
    try {
      setLoading(true);
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        email: email,
        photoURL: photoURL,
      });
      setLoading(false);
    } catch (error) {
      alert(error);
    }
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
    borderBottomColor: "gray",
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
  },
  medium: {
    backgroundColor: "#f39845",
  },
  strong: {
    backgroundColor: "#57c558",
  },
});
