import React from "react";
import {
  View,
  Button,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native-web";

const CreateUserScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <TextInput placeholder="User Name" />
      </View>
      <View style={styles.inputGroup}>
        <TextInput placeholder="User Email" />
      </View>
      <View style={styles.inputGroup}>
        <TextInput placeholder="User Phone" />
      </View>
      <View>
        <Button title="Save User" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 35,
  },
  inputGroup: {
    flex: 1,
    padding: 0,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
  },
});

export default CreateUserScreen;
