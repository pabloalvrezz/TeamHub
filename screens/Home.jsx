import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ActivityIndicator, List } from "react-native-paper";
import { auth } from "../screens/Login";
import {
  getFirestore,
  getDoc,
  doc,
  collection,
  getDocs,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";

const lightColor = "#fff";
const darkColor = "#252525";

export default function Home({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const db = getFirestore();
  const { t } = useTranslation();

  useEffect(() => {
    const obtainUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        const uid = currentUser.uid;

        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userDataFromDB = userDocSnap.data();
          setUserData(userDataFromDB);
        } else {
          console.log("No user data found for the current user");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const obtainEventData = async () => {
      try {
        const eventsCollectionRef = collection(db, "events");
        const querySnapshot = await getDocs(eventsCollectionRef);
        const eventsData = [];

        querySnapshot.forEach((doc) => {
          eventsData.push(doc.data());
        });

        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    const obtainTeamData = async () => {
      try {
        const teamsData = [
          {
            id: 1,
            name: "Equipo 1",
            trainer: "Entrenador 1",
            photoUrl:
              "https://firebasestorage.googleapis.com/v0/b/teamhub-8ab29.appspot.com/o/images%2FteamPictures%2FindustrialPicture.webp?alt=media&token=329895a7-cb96-4f7f-98f0-5aa54dce92b8",
          },
          {
            id: 2,
            name: "Equipo 2",
            trainer: "Entrenador 2",
            photoUrl:
              "https://firebasestorage.googleapis.com/v0/b/teamhub-8ab29.appspot.com/o/images%2FteamPictures%2FindustrialPicture.webp?alt=media&token=329895a7-cb96-4f7f-98f0-5aa54dce92b8",
          },
          {
            id: 3,
            name: "Equipo 3",
            trainer: "Entrenador 3",
            photoUrl:
              "https://firebasestorage.googleapis.com/v0/b/teamhub-8ab29.appspot.com/o/images%2FteamPictures%2FindustrialPicture.webp?alt=media&token=329895a7-cb96-4f7f-98f0-5aa54dce92b8",
          },
        ];
        setTeams(teamsData);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    obtainUserData();
    obtainEventData();
    obtainTeamData();
  }, []);

  // Function to show the details of an event
  const showEventDetails = () => {
    console.log("Event details will be shown");
  };

  // Function to render the add button only for users with the correct role
  const renderAddButton = (functionToExecute) => {
    // To add a team you need to be an admin or a team organizer
    // To add an event you need to be an admin, a trainer or a team organizer
    const allowedRoles =
      functionToExecute === addTeam
        ? ["admin", "teamOrganizer"]
        : ["admin", "trainer", "teamOrganizer"];

    return (
      userData &&
      allowedRoles.includes(userData.role) && (
        <TouchableOpacity onPress={functionToExecute}>
          <FontAwesome name="plus" size={18} color={darkColor} />
        </TouchableOpacity>
      )
    );
  };

  const addEvent = () => {
    navigation.navigate("EventDetails");
  };

  const addTeam = () => {
    navigation.navigate("TeamDetails");
  };

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <View style={styles.teamsContainer}>
            <View style={styles.teamsTitle}>
              <Text style={styles.titleText}>{t("teams")}</Text>
              {renderAddButton(addTeam)}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teamCardsContainer}
            >
              {teams.map((team) => (
                <TouchableOpacity key={team.id} style={styles.teamCard}>
                  <Image
                    source={{ uri: team?.photoUrl }}
                    style={styles.teamImage}
                  />
                  <Text>{team.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.eventsContainer}>
            <View style={styles.eventsTitle}>
              <Text style={styles.titleText}>{t("events")}</Text>
              {renderAddButton(addEvent)}
            </View>
            <View style={styles.events}>
              <ScrollView style={styles.scrollView}>
                <List.Section style={styles.listStyle}>
                  {events.map((event, index) => (
                    <List.Item
                      key={index}
                      title={
                        <View style={styles.listItemContent}>
                          <TouchableOpacity onPress={showEventDetails}>
                            <FontAwesome
                              name="calendar"
                              size={18}
                              color={darkColor}
                            />
                            <Text style={styles.listItemTitle}>
                              {event.title}
                            </Text>
                            <Text style={styles.eventCreator}>
                              {event.creator}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      }
                      style={styles.listItem}
                    />
                  ))}
                </List.Section>
              </ScrollView>
            </View>
          </View>
        </>
      ) : (
        <ActivityIndicator color="#00b4d8" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lightColor,
  },
  teamsContainer: {
    borderRadius: 27,
    height: "30%",
    width: "80%",
    position: "absolute",
    top: "17%",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  eventsContainer: {
    borderRadius: 27,
    height: "40%",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "absolute",
    bottom: "7%",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  teamsTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  eventsTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  titleText: {
    marginRight: 10,
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: 20,
  },
  teamCardsContainer: {
    paddingHorizontal: 10,
  },
  teamCard: {
    backgroundColor: "#eee",
    borderRadius: 10,
    width: 200,
    height: "100%",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  teamImage: {
    width: 100,
    height: 120,
    borderRadius: 0,
    marginBottom: 10,
  },
  events: {
    height: "70%",
    width: "80%",
    marginBottom: 20,
    backgroundColor: "#eee",
    borderRadius: 15,
    padding: 10,
  },
  listItemContent: {
    color: darkColor,
    width: "100%",
  },
  scrollView: {
    height: "100%",
    width: "100%",
  },
  eventCreator: {
    color: "#6c757d",
    fontSize: 14,
  },
});
