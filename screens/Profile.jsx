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
} from "react-native";

import { firebase } from "@react-native-firebase/storage";

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
      aspect: [4, 3],
    });

    if (result && !result.cancelled) {
      setSelectedImage(result);

      uploadImage(selectedImage.assets[0].uri)
        .then((resolve) => {
          let ref = firebase
            .storage()
            .ref()
            .child("images/profilePictures/" + userData.uid);
          ref
            .put(resolve)
            .then((resolve) => {
              console.log("Image uploaded succesfully");
              userData.photoURL = selectedImage.assets[0].uri
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.profilePhoto}>
        {userData?.photoURL ? (
          <Image source={{ uri: userData.photoURL }} style={styles.profile} />
        ) : (
          <FontAwesome5
            name="user-circle"
            size={120}
            color="grey"
            style={styles.profile}
          />
        )}
        <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
          <FontAwesome5 name="plus" size={20} color="grey" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.inputField}>
          <TextInput
            placeholder="User"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
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
          />
          <View style={styles.inputFieldIcon}>
            <FontAwesome5 name="envelope" size={20} color="grey" />
          </View>
        </View>

        <View style={styles.inputField}>
          <TextInput placeholder="Password" style={styles.input} />
          <TouchableOpacity style={styles.inputFieldIcon}>
            <FontAwesome5 size={20} color="grey" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputField}>
          <TextInput placeholder="Repeat Password" style={styles.input} />
          <TouchableOpacity style={styles.inputFieldIcon}>
            <FontAwesome5 size={20} color="grey" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            console.log(userData.uid);
          }}
        >
          <Text>Pulsame</Text>
        </TouchableOpacity>
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
    borderRadius: 50,
  },

  uploadButton: {
    position: "absolute",
    right: -15,
    bottom: 0,
    borderRadius: 50,
    padding: 5,
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
