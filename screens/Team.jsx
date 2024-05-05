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
  ActivityIndicator,
} from "react-native";
import appFirebase from "../credencials";

export default function Team() {
  const auth = getAuth(appFirebase);
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTeam();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Function to fetch team data
  fetchTeam = async () => {
    setLoading(true);
    const db = getFirestore();
    const teamRef = collection(db, "teams");
    const q = query(
      teamRef,
      where("trainer.email", "==", auth.currentUser.email)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      setTeam(doc.data());
    });
    setLoading(false);
    console.log(team);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#00b4d8" />
      ) : (
        <View></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#00b4d8",
    padding: 10,
    borderRadius: 5,
  },
});
