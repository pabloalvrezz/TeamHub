import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
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

const [lightColor, darkColor] = ["#fff", "#252525"];

export default function Home({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const db = getFirestore();

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

    obtainUserData();
    obtainEvents();
  }, []);

  // Function to get the events from the database
  // associated with the current user and the user's team
  const obtainEvents = async () => {
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

  const showEventDetails = () => {
    console.log("Event details will be shown");
  };

  const renderAddEventButton = () => {
    // Only allow users with the roles "admin", "trainer" and "teamOrganizer" to add events
    const allowedRoles = ["admin", "trainer", "teamOrganizer"];

    return (
      userData &&
      allowedRoles.includes(userData.role) && (
        <TouchableOpacity onPress={addEvent}>
          <FontAwesome name="plus" size={18} color={darkColor} />
        </TouchableOpacity>
      )
    );
  };

  const addEvent = () => {
    navigation.navigate("EventDetails");
  };

  return (
    <View style={styles.container}>
      {!userData ? (
        <ActivityIndicator color="#00b4d8" />
      ) : (
        <View style={styles.eventsContainer}>
          <View style={styles.eventsTitle}>
            <Text style={styles.eventsTitleText}>Events</Text>
            {renderAddEventButton()}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  eventsContainer: {
    borderRadius: 27,
    height: "40%",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "absolute",
    bottom: "7%",
  },
  eventsTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  eventsTitleText: {
    marginRight: 10,
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: 20,
  },
  events: {
    height: "70%",
    width: "80%",
    marginBottom: 20,
    backgroundColor: "#eee",
    borderRadius: 15,
    padding: 10,
  },
  listItem: {
    marginBottom: 8,
    borderRadius: 10,
    width: "100%",
  },
  listItemTitle: {
    fontWeight: "bold",
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
