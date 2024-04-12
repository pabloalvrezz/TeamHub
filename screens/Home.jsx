import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { List } from "react-native-paper";

const [lightColor, darkColor] = ["#fff", "#252525"];

export default function Home({ navigation }) {
  const showEventDetails = () => {
    console.log("funca");
  };

  const addEvent = () => {
    navigation.navigate("EventDetails");
  };

  return (
    <View style={styles.container}>
      <View style={styles.eventsContainer}>
        <View style={styles.eventsTitle}>
          <Text style={styles.eventsTitleText}>Events</Text>
          <TouchableOpacity onPress={addEvent}>
            <FontAwesome name="plus" size={18} color={darkColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.events}>
          <ScrollView style={styles.scrollView}>
            <List.Section style={styles.listStyle}>
              <List.Item
                title={
                  <View style={styles.listItemContent}>
                    <TouchableOpacity onPress={showEventDetails}>
                      <FontAwesome
                        name="calendar"
                        size={18}
                        color={darkColor}
                      />
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
                      <FontAwesome
                        name="calendar"
                        size={18}
                        color={darkColor}
                      />
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
                      <FontAwesome
                        name="calendar"
                        size={18}
                        color={darkColor}
                      />
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
        </View>
      </View>
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
