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
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { List } from "react-native-paper";
import { auth } from "../screens/Login";
import {
  getFirestore,
  getDoc,
  doc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import Animated, { FadeOut } from "react-native-reanimated";

const lightColor = "#f0f0f0";
const darkColor = "#333";
const primaryColor = "#00b4d8";
const secondaryColor = "#023e8a";
const grayColor = "#e0e0e0";

export default function Home({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const db = getFirestore();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      obtainUserData();
      obtainEventData();
      obtainTeamData();
    });

    return unsubscribe;
  }, [navigation]);

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
        eventsData.push({ id: doc.id, ...doc.data() });
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

  const showEventDetails = (event) => {
    const allowedRoles = ["admin", "trainer"];
    if (userData && allowedRoles.includes(userData.role)) {
      navigation.navigate("EventDetails", { event });
    } else {
      setSelectedEvent(event);
      setModalVisible(true);
    }
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

  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      setEvents(events.filter((event) => event.id !== eventId));
      Alert.alert(t("success"), t("eventDeleted"));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
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
                {teams.map((team, index) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamCard,
                      index % 2 === 0 && { backgroundColor: grayColor },
                    ]}
                  >
                    <Image
                      source={{ uri: team?.profileImage }}
                      style={styles.teamImage}
                    />
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamClub}>{team.club}</Text>
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
            {events.length === 0 ? (
              <Text style={styles.noEventsText}>{t("noEvents")}</Text>
            ) : (
              <ScrollView style={styles.events}>
                <List.Section style={styles.listStyle}>
                  {events.map((event, index) => (
                    <Animated.View key={event.id} exiting={FadeOut}>
                      <List.Item
                        title={
                          <View style={styles.listItemContent}>
                            <TouchableOpacity
                              onPress={() => showEventDetails(event)}
                            >
                              <FontAwesome
                                name="calendar"
                                size={18}
                                color={primaryColor}
                              />
                              <Text style={styles.listItemTitle}>
                                {event.title}
                              </Text>
                              <Text style={styles.eventCreator}>
                                {event.creator}
                              </Text>
                            </TouchableOpacity>
                            {userData && userData.role === "admin" && (
                              <TouchableOpacity
                                style={styles.trashButton}
                                onPress={() => deleteEvent(event.id)}
                              >
                                <FontAwesome
                                  name="trash"
                                  size={18}
                                  color="red"
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        }
                        style={[
                          styles.listItem,
                          index % 2 === 1 && { backgroundColor: grayColor },
                        ]}
                      />
                    </Animated.View>
                  ))}
                </List.Section>
              </ScrollView>
            )}
          </View>
          <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {selectedEvent && (
                  <View>
                    <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                    <Text style={styles.modalText}>
                      {t("date")}: {selectedEvent.date}
                    </Text>
                    <Text style={styles.modalText}>
                      {t("time")}: {selectedEvent.time}
                    </Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>{t("close")}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Modal>
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
    paddingTop: 10,
  },
  teamsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  eventsContainer: {
    marginTop: "10%",
    paddingHorizontal: 20,
  },
  teamsTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  eventsTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 24,
    color: darkColor,
  },
  teamCardsContainer: {
    marginTop: 10,
  },
  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 160,
    height: 200,
    marginRight: 15,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  teamImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  teamName: {
    fontWeight: "bold",
    fontSize: 16,
    color: darkColor,
  },
  teamClub: {
    fontSize: 12,
    color: primaryColor,
  },
  events: {
    marginTop: 10,
    height: 300,
  },
  listStyle: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  listItem: {
    marginBottom: 10,
    borderRadius: 10,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    width: "100%",
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: darkColor,
  },
  eventCreator: {
    fontSize: 14,
    color: "#6c757d",
  },
  trashButton: {
    position: "absolute",
    right: -10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: darkColor,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    color: darkColor,
  },
  closeButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: primaryColor,
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
});
