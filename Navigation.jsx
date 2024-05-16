import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import ForgetPassword from "./screens/ForgetPassword";
import Home from "./screens/Home";
import Login, { auth } from "./screens/Login";
import Register from "./screens/Register";
import Team from "./screens/Team";

import Statistics from "./screens/Statistics";
import Profile from "./screens/Profile";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Search from "./screens/Search";
import SearchedUser from "./screens/SearchedUser";
import EventDetails from "./screens/EventDetails";
import { useTranslation } from "react-i18next";
import TeamDetails from "./screens/TeamDetails";
import CreateTrainer from "./screens/CreateTrainer";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import AddPlayer from "./screens/AddPlayer";

const Stack = createStackNavigator();
const Tabs = createMaterialBottomTabNavigator();

export default function MyStack(props) {
  const { t } = useTranslation();
  return (
    <NavigationContainer>
      <Stack.Navigator>
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
          {...props}
        />
        <Stack.Screen
          name="App"
          options={{ headerShown: false }}
          component={MyTabs}
          {...props}
        />
        <Stack.Screen name="SearchedUser" component={SearchedUser} />
        <Stack.Screen
          name="EventDetails"
          component={EventDetails}
          options={{ title: t("createEvent") }}
        />
        <Stack.Screen
          name="TeamDetails"
          component={TeamDetails}
          options={{ title: t("createTeam") }}
        />
        <Stack.Screen
          name="CreateTrainer"
          component={CreateTrainer}
          options={{ title: t("createNewTrainer") }}
          {...props}
        />
        <Stack.Screen
          name="AddPlayer"
          component={AddPlayer}
          options={{ title: t("addPlayer") }}
          {...props}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MyTabs(props) {
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const HideBarLabel = () => null;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const db = getFirestore();
        const currentUser = auth.currentUser;
        const uid = currentUser.uid;

        const userRef = collection(db, "users");
        const q = query(userRef, where("uid", "==", uid));

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const user = doc.data();

          setUserData(user);
          console.log(userData);
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      shifting={true}
      barStyle={{
        backgroundColor: "#fff",
        borderTopColor: "#00b4d8",
        borderTopWidth: 1,
      }}
      activeColor="#00b4d8"
      inactiveColor="#6c757d"
    >
      <Tabs.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
          tabBarLabel: HideBarLabel,
        }}
        props={props}
      />
      {userData && userData.role === "trainer" && (
        <Tabs.Screen
          name="Team"
          component={Team}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="account-group"
                color={color}
                size={26}
              />
            ),
            tabBarLabel: HideBarLabel,
          }}
          props={props}
        />
      )}
      <Tabs.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={26} />
          ),
          tabBarLabel: HideBarLabel,
        }}
        props={props}
      />
      {userData && userData.role === "player" && (
        <Tabs.Screen
          name="Statistics"
          component={Statistics}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="chart-pie"
                color={color}
                size={26}
              />
            ),
            tabBarLabel: HideBarLabel,
          }}
          props={props}
        />
      )}
      <Tabs.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          ),
          tabBarLabel: HideBarLabel,
        }}
        props={props}
      />
    </Tabs.Navigator>
  );
}
