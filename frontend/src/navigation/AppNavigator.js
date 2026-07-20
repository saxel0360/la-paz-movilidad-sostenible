import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../ruteo/screens/WelcomeScreen";
import RoutePlannerScreen from "../ruteo/screens/RoutePlannerScreen";
import DestinationSearch from "../ruteo/screens/DestinationSearch";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
        />

        <Stack.Screen
          name="DestinationSearch"
          component={DestinationSearch}
        />
 
        <Stack.Screen
          name="RoutePlanner"
          component={RoutePlannerScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}