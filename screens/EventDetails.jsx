import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { auth } from "./Login";
import { ScrollView } from "react-native-gesture-handler";

export default function EventDetails() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(dayjs());
  const [time, setTime] = useState("");

  const handleSubmit = () => {
    console.log(
      "Event details: " +
        title +
        ", " +
        location +
        ", " +
        date +
        ", " +
        time +
        " created by: " +
        auth.currentUser.displayName
    );
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.label}>Event Title:</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter event title"
        />

        <Text style={styles.label}>Location:</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter event location"
        />

        <View style={styles.container}>
          <DateTimePicker
            minDate={dayjs().format("YYYY-MM-DD")}
            date={date}
            selectedItemColor="#00b4d8"
            onChange={(params) =>
              setDate(
                params.date.format("YYYY-MM-DD"),
                setTime(dayjs().format("HH:mm"))
              )
            }
          />
        </View>

        <Text style={styles.label}>Time:</Text>
        <TextInput
          style={styles.input}
          value={time}
          onChangeText={setTime}
          placeholder="Enter event time"
        />

        <Button title="Create Event" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});
