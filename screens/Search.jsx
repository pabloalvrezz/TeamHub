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

const UserItem = ({ user, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(user)}
      style={styles.userContainer}
    >
      {user?.photoURL ? (
        <Image source={{ uri: user?.photoURL }} style={styles.userImage} />
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
        <Text style={styles.role}>{user?.role}</Text>
        <Text style={styles.clubName}>{user?.clubName}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function Search(props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchFunction();
  }, [searchQuery]);

  // Search users by displayName
  const searchFunction = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");

      const q = query(usersRef, where("displayName", ">=", searchQuery));
      const querySnapshot = await getDocs(q);

      const results = []; // Array to store the results

      // Loop through the results
      for (const docSnapshot of querySnapshot.docs) {
        const userData = docSnapshot.data();

        if (userData?.player || userData?.trainer) {
          const path = userData.player ? userData.player : userData.trainer;
          const clubRef = doc(db, path);
          const clubSnapshot = await getDoc(clubRef);

          if (clubSnapshot.exists()) {
            const club = clubSnapshot.data();
            const clubData = doc(db, "clubs/" + club.club);
            const dataClubRef = await getDoc(clubData);

            if (dataClubRef.exists()) {
              const clubData = dataClubRef.data();
              userData.clubName = clubData.name;

              results.push(userData);
            }
          }
        } else {
          if (userData.uid !== auth.currentUser.uid) {
            results.push(userData);
          }
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
    setLoading(false);
  };

  const navigateUserClicked = (user) => {
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
        <Animated.View
          style={styles.resultsContainer}
          entering={FadeInDown.delay(200)}
        >
          {searchResults.length > 0 && searchQuery.length > 0 ? (
            searchResults.map((user, index) => (
              <UserItem key={index} user={user} onPress={navigateUserClicked} />
            ))
          ) : (
            <Text style={styles.noResultsText}>
              No hay resultados disponibles
            </Text>
          )}
        </Animated.View>
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
          onChangeText={setSearchQuery}
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
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
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
  role: {
    color: "#6c757d",
    fontSize: 14,
    marginBottom: 2,
    position: "absolute",
    right: 10,
    top: 10,
  },
  clubName: {
    color: "#6c757d",
    fontSize: 14,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    color: "#6c757d",
  },
});
