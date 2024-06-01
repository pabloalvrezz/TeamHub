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
  ScrollView,
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

  const fetchTrainers = async () => {
    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("role", "==", "trainer"),
        where("team", "==", "")
      );
      const querySnapshot = await getDocs(q);

      const trainersData = [];

      querySnapshot.forEach((doc) => {
        trainersData.push(doc.data());
      });

      setTrainers(trainersData);
    } catch (error) {
      console.error("Error getting trainers: ", error);
    }
  };

  const fetchClubs = async () => {
    try {
      const db = getFirestore();
      const clubsRef = collection(db, "clubs");
      const querySnapshot = await getDocs(clubsRef);
      const clubsData = [];
      querySnapshot.forEach((doc) => {
        clubsData.push(doc.data());
      });

      setClubs(clubsData);
    } catch (error) {
      console.error("Error getting clubs: ", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSelectTrainer = (trainer) => {
    setHideForm(false);
    setShowTrainerDropdown(false);
    setHideClubDropdown(true);
    setSelectedTrainer(trainer);
  };

  const handleSelectClub = (club) => {
    setHideForm(false);
    setShowClubDropdown(false);
    setHideTrainerDropdown(true);
    setSelectedClub(club);
  };

  const createNewTrainer = () => {
    navigation.navigate("CreateTrainer");
  };

  const createTeam = async () => {
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
        trainer: selectedTrainer.uid,
        club: selectedClub.name,
        profileImage: downloadURL,
      });

      setLoading(false);
      navigation.navigate("Home");
      Alert.alert(t("success"), t("teamCreated"));
      setName("");
      setProfileImage(null);
      setSelectedTrainer(null);
      setSelectedClub(null);
    } catch (error) {
      console.error("Error creating team: ", error);
      setLoading(false);
    }
  };

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
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(200 * index)}
                >
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      index % 2 === 0 && { backgroundColor: "#f9f9f9" },
                    ]}
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
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(200 * index)}
                >
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
    <ScrollView contentContainerStyle={styles.container}>
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
              setShowTrainerDropdown(!showTrainerDropDown);
              setShowClubDropdown(false);
              setHideClubDropdown(!hideClubDropdown);
              setHideForm(showTrainerDropDown ? false : true);
            }}
          >
            <Text style={styles.dropDownButtonText}>
              {selectedTrainer
                ? `${selectedTrainer.name} ${selectedTrainer.firstSurname} ${selectedTrainer.middleSurname}`
                : t("selectTrainer")}
            </Text>
            <FontAwesome
              type="font-awesome"
              name={showTrainerDropDown ? "chevron-up" : "chevron-down"}
            />
            {renderTrainerDropDown()}
          </TouchableOpacity>
        )}

        {hideClubDropdown && (
          <TouchableOpacity
            style={styles.dropDownButton}
            onPress={() => {
              setShowClubDropdown(!showClubDropDown);
              setShowTrainerDropdown(false);
              setHideTrainerDropdown(!hideTrainerDropdown);
              setHideForm(showClubDropDown ? false : true);
            }}
          >
            <Text style={styles.dropDownButtonText}>
              {selectedClub ? selectedClub.name : t("selectClub")}
            </Text>
            <FontAwesome
              type="font-awesome"
              name={showClubDropDown ? "chevron-up" : "chevron-down"}
            />
            {renderClubDropDown()}
          </TouchableOpacity>
        )}
      </View>

      {!hideForm && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("namePlaceHolder")}:</Text>
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
            <Text style={styles.label}>{t("profileImagePlaceHolder")}:</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={selectImage}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10, 10, 10, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: "80%",
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
    width: "100%",
    paddingHorizontal: 10,
    zIndex: 1,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
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
    borderRadius: 5,
    elevation: 2,
    zIndex: 2,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
  },
  trainerImage: {
    width: 32,
    height: 32,
    borderRadius: 12,
    marginLeft: 10,
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
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#00b4d8",
    borderRadius: 30,
    paddingVertical: 20,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  imagePicker: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 5,
  },
});
