import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Text,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth } from "./Login";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserItem = ({
  index,
  user,
  onPress,
  showDeleteIcon,
  deleteFromHistory,
}) => {
  return (
    <Animated.View entering={FadeInDown.delay(200 * index)}>
      <TouchableOpacity
        onPress={() => onPress(user)}
        style={styles.userContainer}
      >
        {user?.photoURL ? (
          <Animated.Image
            sharedTransitionTag={user.displayName}
            source={{ uri: user?.photoURL }}
            style={styles.userImage}
          />
        ) : (
          <FontAwesome5
            name="user-circle"
            size={50}
            color="#6c757d"
            style={styles.userImage}
          />
        )}
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>{user?.displayName}</Text>
          {user?.clubName && (
            <Text style={styles.clubName}>{user?.clubName}</Text>
          )}
        </View>
        {showDeleteIcon && (
          <TouchableOpacity onPress={() => deleteFromHistory(user)}>
            <FontAwesome5
              name="times-circle"
              size={20}
              color="#ccc"
              style={styles.deleteIcon}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Search(props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    getSearchHistory();
    setSearchQuery("");
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(searchHistory);
    }
  }, [searchQuery, searchHistory]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      setSearchQuery("");
    });

    return unsubscribe;
  }, [props.navigation]);

  // Search users by displayName
  const searchFunction = async () => {
    setLoading(true);
    try {
      // Limpiar los resultados de búsqueda si se realiza una búsqueda
      setSearchResults([]);

      const db = getFirestore();
      const usersRef = collection(db, "users");

      const q = query(
        usersRef,
        where("displayName", ">=", searchQuery),
        where("displayName", "<=", searchQuery + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);

      const results = []; // Array to store the results

      querySnapshot.forEach((doc) => {
        if (doc.data().uid !== auth.currentUser.uid) results.push(doc.data());
      });

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
    setLoading(false);
  };

  // Function to save the user to the search history
  const saveToHistory = async (user) => {
    try {
      let updatedSearchHistory = [...searchHistory];

      // Add the user to the search history if it's not already there
      if (!updatedSearchHistory.some((u) => u.uid === user.uid)) {
        updatedSearchHistory.push(user);
        setSearchHistory(updatedSearchHistory);
        await AsyncStorage.setItem(
          "searchHistory",
          JSON.stringify(updatedSearchHistory)
        );
      }
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  // Function to get the search history
  const getSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem("searchHistory");

      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Error getting search history:", error);
    }
  };

  // Function to delete a user from the search history
  const deleteFromHistory = async (user) => {
    try {
      let updatedSearchHistory = [...searchHistory];

      // Find the index of the user in the search history
      const index = updatedSearchHistory.findIndex((u) => u.uid === user.uid);

      // Remove the user from the search history if found
      if (index !== -1) {
        updatedSearchHistory.splice(index, 1);
        setSearchHistory(updatedSearchHistory);
        await AsyncStorage.setItem(
          "searchHistory",
          JSON.stringify(updatedSearchHistory)
        );
      }
    } catch (error) {
      console.error("Error deleting user from search history:", error);
    }
  };

  // Function to navigate to the user profile
  const navigateUserClicked = (user) => {
    saveToHistory(user);
    props.navigation.navigate("SearchedUser", { user });
  };

  const renderResults = () => {
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
          {searchResults.length > 0 ? (
            searchResults.map((user, index) => (
              <UserItem
                key={index}
                user={user}
                index={index}
                onPress={navigateUserClicked}
                showDeleteIcon={searchHistory.includes(user)}
                deleteFromHistory={deleteFromHistory}
              />
            ))
          ) : (
            <Text style={styles.noResultsText}>{t("noresults")}</Text>
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
          placeholder={t("search")}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchFunction}
        />
      </View>
      {renderResults()}
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
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
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
  clubName: {
    color: "#6c757d",
    fontSize: 14,
  },
  deleteIcon: {
    marginRight: 10,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    color: "#ccc",
  },
});
