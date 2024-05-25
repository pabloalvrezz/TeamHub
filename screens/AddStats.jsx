import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { FontAwesome } from "@expo/vector-icons";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export default function AddStats({ route, navigation }) {
  const user = route.params.player;
  const { t } = useTranslation();
  const [goals, setGoals] = useState(0);
  const [passes, setPasses] = useState(0);
  const [yellowCards, setYellowCards] = useState(0);
  const [redCards, setRedCards] = useState(0);
  const [assists, setAssists] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    if (user && user.displayName) {
      navigation.setOptions({ title: user.displayName });
    }
    obtainStats();
  }, []);

  // Function to obtain the stats of the player
  const obtainStats = async () => {
    try {
      const currentPlayer = user.uid;
      const statsRef = doc(db, "stats", currentPlayer);
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        const statsData = statsDoc.data();
        setStats(statsData);

        // Set the stats of the player
        setGoals(statsData.goals);
        setPasses(statsData.passes);
        setAssists(statsData.assists);
        setYellowCards(statsData.yellowCards);
        setRedCards(statsData.redCards);

        console.log("Stats: ", statsData);
      } else {
        console.log("No stats found for this player");
      }
    } catch (error) {
      console.log("Error getting stats: ", error);
    }
  };

  const handleIncrement = (stat) => {
    switch (stat) {
      case "goals":
        setGoals(goals + 1);
        break;
      case "passes":
        setPasses(passes + 1);
        break;
      case "yellowCards":
        setYellowCards(yellowCards + 1);
        break;
      case "redCards":
        setRedCards(redCards + 1);
        break;
      case "assists":
        setAssists(assists + 1);
        break;
      default:
        break;
    }
  };

  const handleDecrement = (stat) => {
    switch (stat) {
      case "goals":
        if (goals > 0) setGoals(goals - 1);
        break;
      case "passes":
        if (passes > 0) setPasses(passes - 1);
        break;
      case "yellowCards":
        if (yellowCards > 0) setYellowCards(yellowCards - 1);
        break;
      case "redCards":
        if (redCards > 0) setRedCards(redCards - 1);
        break;
      case "assists":
        if (assists > 0) setAssists(assists - 1);
        break;
      default:
        break;
    }
  };

  const saveStats = async () => {
    setLoading(true);

    setStats({
      goals,
      passes,
      assists,
      yellowCards,
      redCards,
    });

    const statsRef = doc(db, "stats", user.uid);

    try {
      const docSnapshot = await getDoc(statsRef);

      if (docSnapshot.exists()) {
        await updateDoc(statsRef, {
          goals,
          passes,
          assists,
          yellowCards,
          redCards,
        });
        console.log("Stats updated successfully");
      } else {
        await setDoc(statsRef, {
          goals,
          passes,
          assists,
          yellowCards,
          redCards,
        });
        console.log("Stats created successfully");
      }
    } catch (error) {
      console.error("Error saving stats: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("addStats")}</Text>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>{t("goals")}:</Text>
        <View style={styles.statControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleDecrement("goals")}
          >
            <FontAwesome name="minus" size={20} color="#555" />
          </TouchableOpacity>
          <Text style={styles.statValue}>{goals}</Text>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleIncrement("goals")}
          >
            <FontAwesome name="plus" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>{t("passes")}:</Text>
        <View style={styles.statControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleDecrement("passes")}
          >
            <FontAwesome name="minus" size={20} color="#555" />
          </TouchableOpacity>
          <Text style={styles.statValue}>{passes}</Text>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleIncrement("passes")}
          >
            <FontAwesome name="plus" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>{t("assists")}:</Text>
        <View style={styles.statControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleDecrement("assists")}
          >
            <FontAwesome name="minus" size={20} color="#555" />
          </TouchableOpacity>
          <Text style={styles.statValue}>{assists}</Text>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleIncrement("assists")}
          >
            <FontAwesome name="plus" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>{t("yellowCards")}:</Text>
        <View style={styles.statControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleDecrement("yellowCards")}
          >
            <FontAwesome name="minus" size={20} color="#555" />
          </TouchableOpacity>
          <Text style={styles.statValue}>{yellowCards}</Text>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleIncrement("yellowCards")}
          >
            <FontAwesome name="plus" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>{t("redCards")}:</Text>
        <View style={styles.statControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleDecrement("redCards")}
          >
            <FontAwesome name="minus" size={20} color="#555" />
          </TouchableOpacity>
          <Text style={styles.statValue}>{redCards}</Text>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleIncrement("redCards")}
          >
            <FontAwesome name="plus" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonBox}>
        {loading ? (
          <ActivityIndicator color="#00b4d8" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={saveStats}>
            <Text style={styles.buttonText}>{t("save")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
    color: "#333",
  },
  buttonBox: {
    alignItems: "center",
    marginTop: 30,
  },
  button: {
    backgroundColor: "#00b4d8",
    fontWeight: "bold",
    borderRadius: 30,
    paddingVertical: 20,
    width: "70%",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
