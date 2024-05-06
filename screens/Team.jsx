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
  Alert,
} from "react-native";
import appFirebase from "../credencials";
import { useTranslation } from "react-i18next";

export default function Team({ navigation }) {
  const auth = getAuth(appFirebase);
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const db = getFirestore();
        const userRef = collection(db, "users");
        const q = query(userRef, where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const user = doc.data();

          if (user.role !== "trainer" || user.role !== "player") {
            navigation.navigate("Home");
            Alert.alert(t("alert"), t("noTeam"));
          } else {
            fetchTeam();
          }
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (auth.currentUser) {
      checkUserRole();
    } else {
      navigation.navigate("Login");
    }
  }, [auth.currentUser, navigation]);

  // Function to fetch team data
  const fetchTeam = async () => {
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
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
