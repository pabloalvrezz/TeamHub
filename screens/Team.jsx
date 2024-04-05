import { Text, View, StyleSheet, TouchableOpacity } from "react-native";

export default function Team() {
  return (
    <View style={styles.container}>
      <Text>Team</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
