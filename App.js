import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import UserList from './screens/UserList';
import UserDetailScreen from './screens/UserScreenDetail';
import CreateUserScreen from './screens/CreateUserScreen';

const stack = createStackNavigator();

function MyStack() {
  return (
    <stack.Navigator>
      <stack.Screen name="CreateUserScreen" component={CreateUserScreen}/>
      <stack.Screen name="UserListScreen" component={UserList}/>
      <stack.Screen name="UserDetailScreen" component={UserDetailScreen}/>
    </stack.Navigator>
  );

}

export default function App() {
  return (
    <NavigationContainer>
      <MyStack/>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
