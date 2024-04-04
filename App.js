import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { StyleSheet } from "react-native";

import Home from "./screens/Home";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ForgetPassword from "./screens/ForgetPassword";

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Register"
        component={Register}
        options={{
          title: "Register",
          headerTintColor: "#000",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#00b4d8",
          },
        }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          title: "Login",
          headerTintColor: "#000",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#00b4d8",
          },
        }}
      />
      <Stack.Screen
        name="ForgetPassword"
        component={ForgetPassword}
        options={{
          title: "Forget Password",
          headerTintColor: "#000",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#00b4d8",
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
            backgroundColor: "#00b4d8",
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
