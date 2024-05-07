import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
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

export default function Team({ navigation }) {
  const auth = getAuth(appFirebase);
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(null);
  const [role, setRole] = useState("player");
  const [players, setPlayers] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchRole();
  }, []); // Empty dependency array to run once when component mounts

  // Function to fetch role of the user
  const fetchRole = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      const userRef = collection(db, "users");
      const q = query(userRef, where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        setRole(doc.data().role);
      });

      fetchTeam();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching user role:", error);
    }
  };

  // Function to fetch team data
  const fetchTeam = async () => {
    try {
      setLoading(true);
      const db = getFirestore();

      // Obtain the trainer data
      const teamRef = collection(db, "teams");
      const q = query(teamRef, where("trainer", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        setTeam(doc.data());
      });

      // Add players (I added more sample data for demonstration)
      setPlayers([
        {
          name: "Lionel Messi",
          profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
          position: "Forward",
        },
        {
          name: "Cristiano Ronaldo",
          profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
          position: "Forward",
        },
        {
          name: "Neymar Jr",
          profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
          position: "Forward",
        },
        {
          name: "Kevin De Bruyne",
          profileImage: "https://randomuser.me/api/portraits/men/4.jpg",
          position: "Midfielder",
        },
        {
          name: "Robert Lewandowski",
          profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
          position: "Forward",
        },
        {
          name: "Virgil van Dijk",
          profileImage: "https://randomuser.me/api/portraits/men/6.jpg",
          position: "Defender",
        },
        {
          name: "Kylian Mbappé",
          profileImage: "https://randomuser.me/api/portraits/men/7.jpg",
          position: "Forward",
        },
        {
          name: "Sergio Ramos",
          profileImage: "https://randomuser.me/api/portraits/men/8.jpg",
          position: "Defender",
        },
      ]);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching team data:", error);
    }
  };

  const renderTeamData = () => {
    return (
      <>
        {team && team.profileImage ? (
          <View style={styles.teamData}>
            <Image
              style={styles.teamImage}
              source={{ uri: team.profileImage }}
            />
            <Text style={styles.teamName}>{team.name}</Text>
            <Text>{t("players")}</Text>
            <ScrollView style={styles.players}>
              <List.Section style={styles.listStyle}>
                {players.length > 0 ? (
                  players.map((player, index) => (
                    <List.Item
                      key={index}
                      title={
                        <View style={styles.listItemContent}>
                          <Image
                            style={styles.playerImage}
                            source={{ uri: player.profileImage }}
                          />
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
                            onPress={() => handleDeletePlayer(player)}
                          >
                            <FontAwesome name="trash" size={24} color="red" />
                          </TouchableOpacity>
                        ) : null
                      }
                    />
                  ))
                ) : (
                  <Text>{t("noPlayers")}</Text>
                )}
              </List.Section>
            </ScrollView>
          </View>
        ) : (
          <View style={styles.teamData}>
            <FontAwesome
              style={styles.teamImage}
              name="users"
              size={150}
              color="#00b4d8"
            />
          </View>
        )}
      </>
    );
  };

  const handleDeletePlayer = (player) => {
    console.log("Deleting player:", player.name);
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
});
