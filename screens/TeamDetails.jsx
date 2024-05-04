import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { firebase } from "@react-native-firebase/storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";

export default function TeamDetails({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [trainers, setTrainers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const { t } = useTranslation();
  const [showTrainerDropDown, setShowTrainerDropdown] = useState(false);
  const [showClubDropDown, setShowClubDropdown] = useState(false);
  const [hideForm, setHideForm] = useState(false);
  const [hideTrainerDropdown, setHideTrainerDropdown] = useState(true);
  const [hideClubDropdown, setHideClubDropdown] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [name, setName] = useState("");
  const [touchedName, setTouchedName] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrainers();
      fetchClubs();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  // Function to upload the profile image
  const uploadTeamImage = async (uri, teamName) => {
    try {
      const resolvedImage = await fetch(uri);
      const blob = await resolvedImage.blob();
      const ref = firebase
        .storage()
        .ref()
        .child("images/teamPictures/" + teamName);
      await ref.put(blob);
      return await ref.getDownloadURL();
    } catch (error) {
      throw new Error("Error uploading image: " + error.message);
    }
  };

  // Function to fetch all trainers
  const fetchTrainers = async () => {
    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", "trainer"));
      const querySnapshot = await getDocs(q);

      const trainersData = [];
      querySnapshot.forEach((doc) => {
        trainersData.push(doc.data());
      });

      const unassignedTrainers = [];

      // Iterate over each trainer to check if they are assigned to any team
      for (const trainer of trainersData) {
        const teamRef = collection(db, "teams");
        const q = query(teamRef, where("trainer", "==", trainer));
        const snapshot = await getDocs(q);

        // If the snapshot is empty, the trainer is not assigned to any team
        if (snapshot.empty) {
          unassignedTrainers.push(trainer);
        }
      }

      setTrainers(unassignedTrainers);
    } catch (error) {
      console.error("Error getting trainers: ", error);
    }
  };

  // Function to fetch all clubs
  const fetchClubs = async () => {
    try {
      const db = getFirestore();
      const clubsRef = collection(db, "clubs");
      const querySnapshot = await getDocs(clubsRef);
      const clubsData = [];
      querySnapshot.forEach((doc) => {
        clubsData.push(doc.data());

        setClubs(clubsData);
      });
    } catch (error) {
      console.error("Error getting clubs: ", error);
    }
  };

  // Function to handle the modal close
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Function to handle the form submit
  const handleSelectTrainer = (trainer) => {
    // Hide the form and the dropdown
    setHideForm(false);
    setShowTrainerDropdown(false);
    setHideClubDropdown(true);

    // Set the selected trainer
    setSelectedTrainer(trainer);
  };

  // Function to handle the form submit
  const handleSelectClub = (club) => {
    // Hide the form and the dropdown
    setHideForm(false);
    setShowClubDropdown(false);
    setHideTrainerDropdown(true);

    // Set the selected club
    setSelectedClub(club);
    console.log(selectedClub);
  };

  // Function to create a new trainer
  const createNewTrainer = () => {
    navigation.navigate("CreateTrainer");
  };

  // Function to create a new team
  const createTeam = async () => {
    // Check if the fields are empty
    if (!name.trim() || !selectedTrainer || !selectedClub || !profileImage) {
      Alert.alert(t("alert"), t("teamAlert"));
      return;
    }

    try {
      setLoading(true);

      const db = getFirestore();
      const teamRef = collection(db, "teams");

      const downloadURL = await uploadTeamImage(profileImage, name);

      await setDoc(doc(teamRef, name), {
        name: name,
        trainer: selectedTrainer,
        club: selectedClub,
        profileImage: downloadURL,
      });

      setLoading(false);

      // Alert the user
      Alert.alert(t("success"), t("teamCreated"));

      // Clear the form
      setName("");
      setProfileImage(null);
      setSelectedTrainer(null);
      setSelectedClub(null);
    } catch (error) {
      console.error("Error creating team: ", error);
      setLoading(false);
    }
  };

  // Function render the trainer dropdown
  const renderTrainerDropDown = () => {
    return (
      <View style={styles.dropdown}>
        {showTrainerDropDown && (
          <>
            {trainers.length === 0 ? (
              <View>
                <TouchableOpacity style={styles.dropdownItem}>
                  <Text>{t("noresults")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              trainers.map((trainer, index) => (
                <Animated.View entering={FadeInDown.delay(200 * index)}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleSelectTrainer(trainer);
                    }}
                  >
                    <Text>{trainer.name} </Text>
                    <Text>{trainer.firstSurname} </Text>
                    <Text>{trainer.middleSurname}</Text>
                    {trainer.photoURL ? (
                      <Image
                        style={styles.trainerImage}
                        source={{ uri: trainer.photoURL }}
                      />
                    ) : (
                      <FontAwesome
                        style={styles.trainerImage}
                        type="font-awesome"
                        name="user-circle"
                        size={32}
                      />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </>
        )}
      </View>
    );
  };

  // Function render the club dropdown
  const renderClubDropDown = () => {
    return (
      <View style={styles.dropdown}>
        {showClubDropDown && (
          <>
            {clubs.length === 0 ? (
              <View>
                <TouchableOpacity style={styles.dropdownItem}>
                  <Text>{t("noresults")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              clubs.map((club, index) => (
                <Animated.View entering={FadeInDown.delay(200 * index)}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleSelectClub(club);
                    }}
                  >
                    <Text>{club.name}</Text>
                    <Text>{club.location}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("chooseAnOption")}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                handleCloseModal();
                createNewTrainer();
              }}
            >
              <Text style={styles.modalButtonText}>
                {t("createNewTrainer")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalButtonText}>
                {t("assignExistingTrainer")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View>
        {hideTrainerDropdown && (
          <TouchableOpacity
            style={styles.dropDownButton}
            onPress={() => {
              setShowTrainerDropdown(showTrainerDropDown ? false : true);
              setShowClubDropdown(false);
              setHideClubDropdown(hideClubDropdown ? false : true);
              setHideForm(showTrainerDropDown ? false : true);
            }}
          >
            {renderTrainerDropDown()}
            <Text style={styles.dropDownButtonText}>
              {" "}
              {selectedTrainer
                ? selectedTrainer.name +
                  " " +
                  selectedTrainer.firstSurname +
                  " " +
                  selectedTrainer.middleSurname +
                  " "
                : t("selectTrainer")}
            </Text>
            <FontAwesome type="font-awesome" name="chevron-down" />
          </TouchableOpacity>
        )}

        {hideClubDropdown && (
          <TouchableOpacity
            style={styles.dropDownButton}
            onPress={() => {
              setShowClubDropdown(showClubDropDown ? false : true);
              setShowTrainerDropdown(false);
              setHideTrainerDropdown(hideTrainerDropdown ? false : true);
              setHideForm(showClubDropDown ? false : true);
            }}
          >
            <Text style={styles.dropDownButtonText}>
              {selectedClub ? selectedClub.name : t("selectClub")}
            </Text>
            <FontAwesome type="font-awesome" name="chevron-down" />
            {renderClubDropDown()}
          </TouchableOpacity>
        )}
      </View>

      {!hideForm && (
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

          <TouchableOpacity style={styles.button} onPress={createTeam}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t("createTeam")}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10, 10, 10, 0.5)",
  },
  modalContent: {
    backgroundColor: "#eee",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#00b4d8",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  dropDownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#efefef",
    height: 50,
    width: "90%",
    paddingHorizontal: 10,
    zIndex: 1,
    marginBottom: "10%",
  },
  dropDownButtonText: {
    flex: 1,
    textAlign: "center",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    top: 50,
    width: "100%",
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    flexDirection: "row",
    marginBottom: 10,
    height: 50,
    alignItems: "center",
  },
  trainerImage: {
    width: 32,
    height: 32,
    borderRadius: 12,
    marginLeft: 10,
    position: "absolute",
    right: 10,
    top: 10,
  },
  inputContainer: {
    width: "100%",
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  inputError: {
    borderColor: "red",
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
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 5,
  },
});
