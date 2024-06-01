import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { auth } from "./Login";
import { useTranslation } from "react-i18next";

export default function Statistics() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    obtainStats(); // Llama a obtainStats al principio
    const intervalId = setInterval(obtainStats, 1000); // Llama a obtainStats cada segundo

    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente
  }, []);

  const obtainStats = async () => {
    try {
      const db = getFirestore();
      const statsRef = doc(db, "stats", auth.currentUser.uid);
      const statsDoc = await getDoc(statsRef);

      if (statsDoc && statsDoc.exists()) {
        setStats(statsDoc.data());
      } else {
        setStats(null);
      }
    } catch (error) {
      console.log("Error getting stats: ", error);
    }
  };

  const renderStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <FontAwesome5 name="futbol" size={24} color="#00b4d8" />
          <Text style={styles.statText}>
            {t("goals")}: {stats.goals}
          </Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="arrows-alt-h" size={24} color="#00b4d8" />
          <Text style={styles.statText}>
            {t("passes")}: {stats.passes}
          </Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="hands-helping" size={24} color="#00b4d8" />
          <Text style={styles.statText}>
            {t("assists")}: {stats.assists}
          </Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="square" size={24} color="yellow" />
          <Text style={styles.statText}>
            {t("yellowCards")}: {stats.yellowCards}
          </Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="square" size={24} color="red" />
          <Text style={styles.statText}>
            {t("redCards")}: {stats.redCards}
          </Text>
        </View>
      </View>
    );
  };

  const renderNoStats = () => {
    return (
      <View style={styles.noStatsContainer}>
        <FontAwesome5 name="exclamation-circle" size={24} color="#888" />
        <Text style={styles.noStatsText}>No stats found for this player</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {stats ? renderStats() : renderNoStats()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  statsContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    width: "90%",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statText: {
    fontSize: 18,
    marginLeft: 10,
    color: "#333",
  },
  noStatsContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
  },
  noStatsText: {
    fontSize: 18,
    color: "#888",
    marginTop: 10,
  },
});
