import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import appFirebase from "../credencials";
import { useTranslation } from "react-i18next";
import { FontAwesome } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { List, ActivityIndicator } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { firebase } from "@react-native-firebase/storage";

export default function Team({ navigation }) {
  const auth = getAuth(appFirebase);
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(null);
  const [role, setRole] = useState("player");
  const [players, setPlayers] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    fetchRole();
  }, []);

  const fetchRole = async () => {
    try {
      const db = getFirestore();
      const userRef = collection(db, "users");
      const q = query(userRef, where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        setRole(doc.data().role);
      });

      fetchTeam();
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchTeam = async () => {
    try {
      const db = getFirestore();
      const teamRef = collection(db, "teams");
      const q = query(teamRef, where("trainer", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      Promise.all(
        querySnapshot.docs.map(async (doc) => {
          setTeam(doc.data());
          const playersRef = collection(db, "users");
          const playersQuery = query(
            playersRef,
            where("team", "==", doc.data().name),
            where("role", "==", "player")
          );
          const playersSnapshot = await getDocs(playersQuery);

          const playersData = [];

          playersSnapshot.forEach((playerDoc) => {
            playersData.push(playerDoc.data());
          });

          setPlayers(playersData);
          setLoading(false);
        })
      );
    } catch (error) {
      setLoading(false);
      console.error("Error fetching team data: ", error);
    }
  };

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
          .child("images/teamPictures/" + team.id); // assuming team.id is the document ID
        ref
          .put(resolvedImage)
          .then(() => {
            ref.getDownloadURL().then((url) => {
              setTeam((prevTeam) => ({
                ...prevTeam,
                profileImage: url,
              }));

              updateTeamPhoto(url);
            });
            setLoading(false);
          })
          .catch((error) => {
            alert(t("errorUploadingImage"));
          });
      }
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

  const updateTeamPhoto = async (photoURL) => {
    try {
      setLoading(true);
      const db = getFirestore();
      const teamRef = doc(db, "teams", team.name);
      await updateDoc(teamRef, {
        profileImage: photoURL,
      });
      setLoading(false);
      Alert.alert(t("success"), t("teamPhotoUpdated"));
    } catch (error) {
      alert(error);
    }
  };

  const renderAddPlayerButton = () => {
    return (
      <TouchableOpacity
        style={styles.addPlayerButton}
        onPress={() => navigation.navigate("AddPlayer", { team: team })}
      >
        <FontAwesome name="plus" size={14} color="black" />
      </TouchableOpacity>
    );
  };

  const renderPlayerData = () => {
    return (
      <List.Section style={styles.listStyle}>
        {players.length > 0 ? (
          players.map((player, index) => (
            <List.Item
              key={index}
              title={
                <View style={styles.listItemContent}>
                  {player.profileImage ? (
                    <Image
                      style={styles.playerImage}
                      source={{ uri: player.profileImage }}
                    />
                  ) : (
                    <FontAwesome
                      name="user-circle"
                      size={50}
                      color="grey"
                      style={styles.playerImage}
                    />
                  )}
                  <View style={styles.playerDetails}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerPosition}>
                      Position: {player.position}
                    </Text>
                  </View>
                </View>
              }
              style={styles.listItem}
              right={() =>
                role === "trainer" ? (
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => navigateStats(player)}
                  >
                    <FontAwesome name="pie-chart" size={24} color="#00b4d8" />
                  </TouchableOpacity>
                ) : null
              }
            />
          ))
        ) : (
          <Text>{t("noPlayers")}</Text>
        )}
      </List.Section>
    );
  };

  const renderTeamData = () => {
    if (!team) return null;
    return (
      <>
        {team && team.profileImage ? (
          <View style={styles.teamData}>
            <TouchableOpacity onPress={selectImage}>
              <Image
                style={styles.teamImage}
                source={{ uri: team.profileImage }}
              />
            </TouchableOpacity>
            <Text style={styles.teamName}>{team.name}</Text>
            <View style={styles.playersTextButton}>
              <Text>{t("players")} </Text>
              {role === "trainer" ? renderAddPlayerButton() : null}
            </View>

            <ScrollView style={styles.players}>{renderPlayerData()}</ScrollView>
          </View>
        ) : (
          <View style={styles.teamData}>
            <TouchableOpacity onPress={selectImage}>
              <FontAwesome
                style={styles.teamImage}
                name="users"
                size={150}
                color="#00b4d8"
              />
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  const navigateStats = (player) => {
    navigation.navigate("AddStats", { player: player });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#00b4d8" />
      ) : (
        <View>{renderTeamData()}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  teamData: {
    alignItems: "center",
    marginTop: "20%",
  },
  teamImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  players: {
    marginTop: 5,
    backgroundColor: "#eee",
    borderRadius: 15,
    padding: 10,
    width: "90%",
    height: "70%",
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontWeight: "bold",
  },
  playerPosition: {
    color: "#6c757d",
  },
  deleteIcon: {
    top: "3%",
  },
  playersTextButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addPlayerButton: {
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
    top: 1,
  },
});
