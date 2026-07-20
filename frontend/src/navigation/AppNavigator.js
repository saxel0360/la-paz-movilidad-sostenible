import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Pantallas UI
import SplashScreen from "../screens/SplashScreen";
import HomeScreen from "../screens/HomeScreen";
import ComingSoonScreen from "../screens/ComingSoonScreen";
import TransportModesScreen from "../screens/TransportModesScreen";
import DashboardScreen from "../screens/DashboardScreen";
import SmartStopsScreen from "../screens/SmartStopsScreen";

// Pantallas de Ruteo
import RoutePlannerScreen from "../ruteo/screens/RoutePlannerScreen";
import DestinationSearch from "../ruteo/screens/DestinationSearch";
import RouteResultsScreen from "../ruteo/screens/RouteResultsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Tu flujo */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen
          name="ComingSoon"
          component={ComingSoonScreen}
        />

        <Stack.Screen
          name="TransportModes"
          component={TransportModesScreen}
        />

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
        />

        <Stack.Screen
          name="SmartStops"
          component={SmartStopsScreen}
        />

        {/* Flujo de ruteo */}
        <Stack.Screen
          name="DestinationSearch"
          component={DestinationSearch}
        />

        <Stack.Screen
          name="RoutePlanner"
          component={RoutePlannerScreen}
        />

        <Stack.Screen
          name="RouteResults"
          component={RouteResultsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}