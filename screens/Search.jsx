import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function Search({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Function to search on the database
  const searchFunction = async () => {
    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");

      const q = query(usersRef, where("displayName", ">=", searchQuery));

      const querySnapshot = await getDocs(q);

      const results = [];

      querySnapshot.forEach((doc) => {
        results.push(doc.data());
      });

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome5
          name="search"
          size={20}
          color="grey"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchFunction();
          }}
        />
      </View>
      <View style={styles.resultsContainer}>
        {searchResults.length > 0 && searchQuery.length > 0 ? (
          searchResults.map((user, index) => (
            <TouchableOpacity key={index} onPress={() => console.log(user)}>
              <Text>{user?.displayName}</Text>
              {user.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={{ width: 100, height: 100 }}
                />
              ) : (
                <Text>No photo available</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text>No hay resultados disponibles</Text>
        )}
      </View>
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
  searchContainer: {
    position: "absolute",
    top: "10%",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    width: "90%",
    marginHorizontal: "5%",
    zIndex: 1,
    backgroundColor: "#ffffff",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  resultsContainer: {
    marginTop: 60,
  },
});
