import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import dayjs from "dayjs";
import { auth } from "./Login";
import { globalStyle } from "./globalStyles/styles";
import { FontAwesome } from "@expo/vector-icons";

export default function EventDetails() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [mode, setMode] = useState("date");
  const [time, setTime] = useState("");
  const [allFields, setAllFields] = useState(false);

  useEffect(() => {
    if (title && date && time) {
      setAllFields(true);
    } else {
      setAllFields(false);
    }
  }, [title, date, time]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;

    if (mode === "date") {
      setShowDate(false);
    } else {
      setShowTime(false);
      setTime(currentDate.toLocaleTimeString());
    }

    setDate(currentDate);
  };

  const showMode = (modeToShow) => {
    if (modeToShow === "date") {
      setShowDate(true);
      setShowTime(false);
    } else {
      setShowTime(true);
      setShowDate(false);
    }
    setMode(modeToShow);
  };

  // Function to handle the form submission
  const createEvent = () => {

    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    
    // Create a new event
    const event = {
      title,
      date: formattedDate,
      time,
      user: auth.currentUser.displayName,
    };

    // Save the event in the database
    
  };

  return (
    <View
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={100}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter event title"
        />
      </View>
      <View style={styles.inputDate}>
        <TouchableOpacity onPress={() => showMode("date")}>
          <Text style={styles.dateButtonText}>Select date</Text>
          <Text style={styles.dateButtonIcon}>
            <FontAwesome name="calendar" size={18} color={"black"} />
          </Text>
        </TouchableOpacity>
        {showDate && (
          <DateTimePicker
            value={date}
            mode="date"
            is24Hour={true}
            display="spinner"
            onChange={onChange}
          />
        )}
      </View>

      <View style={styles.inputTime}>
        <TouchableOpacity onPress={() => showMode("time")}>
          <Text style={styles.timeButtonText}>Select time</Text>
          <Text style={styles.timeButtonIcon}>
            <FontAwesome name="clock-o" size={18} color={"black"} />
          </Text>
        </TouchableOpacity>
        {showTime && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={onChange}
          />
        )}
      </View>

      {allFields && (
        <TouchableOpacity style={styles.createButton} onPress={createEvent}>
          <Text style={styles.createButtonText}>Create event</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#333",
  },

  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },

  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    width: "100%",
  },

  inputDate: {
    width: "100%",
    marginBottom: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
    height: "10%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },

  dateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "left",
  },

  dateButtonIcon: {
    position: "absolute",
    right: 20,
  },

  inputTime: {
    width: "100%",
    marginBottom: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
    height: "10%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },

  timeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "left",
  },

  timeButtonIcon: {
    position: "absolute",
    right: 20,
  },

  createButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 50,
    height: "8%",
    justifyContent: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});