import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  SafeAreaView,
} from "react-native";
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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    obtainUserData();
    obtainEventData();
    obtainTeamData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    obtainUserData();
    obtainEventData();
    obtainTeamData();
    setRefreshing(false);
  }, []);

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
      const teamsCollectionRef = collection(db, "teams");
      const querySnapshot = await getDocs(teamsCollectionRef);
      const teamsData = [];

      querySnapshot.forEach((doc) => {
        teamsData.push(doc.data());
      });

      setTeams(teamsData);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const showEventDetails = () => {
    console.log("Event details will be shown");
  };

  const renderAddButton = (functionToExecute) => {
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
    <SafeAreaView style={styles.container}>
      {userData ? (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.teamsContainer}>
            <View style={styles.teamsTitle}>
              <Text style={styles.titleText}>{t("teams")} </Text>
              {renderAddButton(addTeam)}
            </View>
            {teams.length === 0 ? (
              <TouchableOpacity style={styles.teamCard}>
                <Text style={{ marginBottom: 10 }}>{t("noTeams")}</Text>
                <FontAwesome name="users" size={24} color={darkColor} />
              </TouchableOpacity>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.teamCardsContainer}
              >
                {teams.map((team) => (
                  <TouchableOpacity key={team.id} style={styles.teamCard}>
                    <Image
                      source={{ uri: team?.profileImage }}
                      style={styles.teamImage}
                    />
                    <Text>{team.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.eventsContainer}>
            <View style={styles.eventsTitle}>
              <Text style={styles.titleText}>{t("events")} </Text>
              {renderAddButton(addEvent)}
            </View>
            <ScrollView style={styles.events}>
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
        </ScrollView>
      ) : (
        <ActivityIndicator color="#00b4d8" />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColor,
  },
  teamsContainer: {
    marginTop: "15%",
    paddingHorizontal: 10,
  },
  eventsContainer: {
    marginTop: "10%",
    paddingHorizontal: 10,
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
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: 20,
  },
  teamCardsContainer: {
    marginTop: 5,
  },
  teamCard: {
    backgroundColor: "#eee",
    borderRadius: 10,
    width: 200,
    height: 200,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  teamImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  events: {
    marginTop: 5,
    backgroundColor: "#eee",
    borderRadius: 15,
    padding: 10,
    height: 300,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemTitle: {},
  eventCreator: {
    color: "#6c757d",
    fontSize: 14,
  },
});
