import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useState } from 'react';

import DestinationSearchScreen from './src/ruteo/screens/DestinationSearch';
import RoutePlannerScreen from './src/ruteo/screens/RoutePlannerScreen';

export default function App() {

  const [screen, setScreen] = useState('search');

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {
        screen === 'search'
        ?
        <DestinationSearchScreen 
          goToRoute={() => setScreen('route')}
        />
        :
        <RoutePlannerScreen />
      }

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});