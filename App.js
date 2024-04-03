import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { StyleSheet, Text, View } from "react-native";

import Home from "./screens/Home";
import Login from "./screens/Login";

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          title: "Login",
          headerTintColor: "#000",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#f2aa1f",
          },
        }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          title: "Home",
          headerTintColor: "#000",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#f2aa1f",
          },
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
});
