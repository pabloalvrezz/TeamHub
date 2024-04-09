import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth } from "./Login";

export default function Search(props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchFunction = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");

      const q = query(usersRef, where("displayName", ">=", searchQuery));
      const querySnapshot = await getDocs(q);

      // Only get the users that match the search query and are not the current user
      const results = [];
      querySnapshot.forEach((doc) => {
        if (
          doc.data().displayName.includes(searchQuery) &&
          doc.data().displayName !== auth.currentUser.displayName
        ) {
          results.push(doc.data());
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
    setLoading(false);
  };

  // Function to navigate to the SearchedUser screen
  const navigateUserClicked = (user) => {
    props.navigation.navigate("SearchedUser", { user });
  };

  const showResults = () => {
    if (loading) {
      return (
        <ActivityIndicator
          style={styles.resultsContainer}
          size="large"
          color="#fff"
        />
      );
    } else {
      return (
        <View style={styles.resultsContainer}>
          {searchResults.length > 0 && searchQuery.length > 0 ? (
            searchResults.map((user, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigateUserClicked(user)}
                style={styles.userContainer}
              >
                {user?.photoURL ? (
                  <Image
                    source={{ uri: user?.photoURL }}
                    style={styles.userImage}
                  />
                ) : (
                  <FontAwesome5
                    name="user-circle"
                    size={50}
                    color="gray"
                    style={styles.userImage}
                  />
                )}
                <Text style={styles.displayName}>{user?.displayName}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResultsText}>
              No hay resultados disponibles
            </Text>
          )}
        </View>
      );
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
      {showResults()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: "10%",
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
    backgroundColor: "#fff",
    width: "100%",
    alignSelf: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: "35%",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
    marginVertical: 5,
  },
  displayName: {
    fontSize: 16,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
});
