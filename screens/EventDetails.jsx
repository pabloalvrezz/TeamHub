import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import dayjs from "dayjs";
import { auth } from "./Login";
import { FontAwesome } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  getFirestore,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ActivityIndicator } from "react-native-paper";
import i18n from "../i18n.config";
import { useTranslation } from "react-i18next";

export default function EventDetails({ route, navigation }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [mode, setMode] = useState("date");
  const [time, setTime] = useState("");
  const [allFields, setAllFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const event = route.params?.event;

  useEffect(() => {
    if (title && date && time) {
      setAllFields(true);
    } else {
      setAllFields(false);
    }
  }, [title, date, time]);

  useEffect(() => {
    console.log(event);
    if (event) {
      setTitle(event.title);
      setDate(new Date(event.date));
      setTime(event.time);
      setAllFields(true);
    }
  }, [event]);

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

  const formateDateOnLanguaje = (date) => {
    return i18n.language === "es"
      ? dayjs(date).format("DD-MM-YYYY")
      : dayjs(date).format("MM-DD-YYYY");
  };

  const createEvent = async () => {
    setLoading(true);
    const formattedDate = dayjs(date).format("YYYY-MM-DD");

    const newEvent = {
      title,
      date: formattedDate,
      time,
      creator: auth.currentUser.displayName,
    };

    const db = getFirestore();
    const eventsRef = collection(db, "events");

    await addDoc(eventsRef, newEvent);

    resetForm();
  };

  const updateEvent = async () => {
    setLoading(true);
    const formattedDate = dayjs(date).format("YYYY-MM-DD");

    const updatedEvent = {
      title,
      date: formattedDate,
      time,
    };

    const db = getFirestore();
    const eventRef = doc(db, "events", event.id);

    await updateDoc(eventRef, updatedEvent);
    navigation.navigate("Home");
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDate(new Date());
    setTime("");
    setAllFields(false);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t("eventTitle")}
        />
      </View>
      <View style={styles.inputDate}>
        <TouchableOpacity
          onPress={() => showMode("date")}
          style={styles.button}
        >
          <Text style={styles.dateButtonText}>
            {date ? formateDateOnLanguaje(date) : t("selectDate")}
          </Text>
          <FontAwesome
            name="calendar"
            size={18}
            color={"#fff"}
            style={styles.icon}
          />
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
        <TouchableOpacity
          onPress={() => showMode("time")}
          style={styles.button}
        >
          <Text style={styles.timeButtonText}>
            {time ? time : t("eventTime")}
          </Text>
          <FontAwesome
            name="clock-o"
            size={18}
            color={"#fff"}
            style={styles.icon}
          />
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
        <TouchableOpacity
          style={styles.createButton}
          onPress={event ? updateEvent : createEvent}
        >
          {loading && <ActivityIndicator color="#fff" />}
          <Text style={styles.createButtonText}>
            {event ? t("updateEvent") : t("createEvent")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  inputDate: {
    marginBottom: 20,
  },
  inputTime: {
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 10,
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  timeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  icon: {
    marginLeft: 10,
  },
  createButton: {
    backgroundColor: "#28a745",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
