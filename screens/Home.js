import { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import appFirebase from "../credencials";

const auth = getAuth(appFirebase);

export default function Home(props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => {auth.signOut, props.navigation.navigate("Login")}} style={styles.button}>
        <Text>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button:{
    backgroundColor: "#00b4d8",
    padding: 10,
    borderRadius: 5,
  }
});
