import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ActivityIndicator, List } from "react-native-paper";
import { auth } from "../screens/Login";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const [lightColor, darkColor] = ["#fff", "#252525"];

export default function Home({ navigation }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const obtainUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        const uid = currentUser.uid;
        const db = getFirestore();

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
  }, []);

  // Function to get the events from the database
  // assosiated with the current user and the user's team
  const getEvents = () => {
    // Get the events from the database
    
  };

  const showEventDetails = () => {
    console.log("funca");
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

  const getEventsList = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <List.Section style={styles.listStyle}>
          <List.Item
            title={
              <View style={styles.listItemContent}>
                <TouchableOpacity onPress={showEventDetails}>
                  <FontAwesome name="calendar" size={18} color={darkColor} />
                </TouchableOpacity>
                <Text style={styles.listItemTitle}>Club presentation</Text>
                <Text>Juan Pérez</Text>
              </View>
            }
            style={styles.listItem}
          />

          <List.Item
            title={
              <View style={styles.listItemContent}>
                <TouchableOpacity onPress={showEventDetails}>
                  <FontAwesome name="calendar" size={18} color={darkColor} />
                </TouchableOpacity>
                <Text style={styles.listItemTitle}>Senior team match</Text>
                <Text>Marcos Rodríguez</Text>
              </View>
            }
            style={styles.listItem}
          />

          <List.Item
            title={
              <View style={styles.listItemContent}>
                <TouchableOpacity onPress={showEventDetails}>
                  <FontAwesome name="calendar" size={18} color={darkColor} />
                </TouchableOpacity>
                <Text style={styles.listItemTitle}>
                  Juvenil team final of the league
                </Text>
                <Text>Roberto Almadena</Text>
              </View>
            }
            style={styles.listItem}
          />
        </List.Section>
      </ScrollView>
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
          <View style={styles.events}>{getEventsList()}</View>
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
  },
  listItemTitle: {
    fontWeight: "bold",
  },

  listItemContent: {
    color: darkColor,
  },

  scrollView: {
    height: "100%",
    width: "100%",
  },
});
