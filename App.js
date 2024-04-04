import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Home from "./screens/Home";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ForgetPassword from "./screens/ForgetPassword";

const Stack = createStackNavigator();

function MyStack({ userLoggedIn }) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userLoggedIn ? (
          <Stack.Screen name="Home" component={Home} />
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={Register}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgetPassword"
              component={ForgetPassword}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in
    AsyncStorage.getItem("userLoggedIn").then((value) => {
      if (value === "true") {
        // The user is logged in
        setUserLoggedIn(true);
      }
    });
  }, []);

  return <MyStack userLoggedIn={userLoggedIn} />;
}
