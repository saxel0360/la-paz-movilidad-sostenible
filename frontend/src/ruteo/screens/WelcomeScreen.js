import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  Image,
  ImageBackground,
  StatusBar,
  Animated,
} from "react-native";

import styles from "../styles/WelcomeScreenStyle";
import { COLORS } from "../../constants/colors";

export default function WelcomeScreen({ navigation }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timers = [
      setTimeout(() => setLoadingText(loadingMessages[1]), 700),
      setTimeout(() => setLoadingText(loadingMessages[2]), 1500),
      setTimeout(() => setLoadingText(loadingMessages[3]), 2300),
    ];

    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start(() => {
      navigation.replace("DestinationSearch");
    });

    return () => timers.forEach(clearTimeout);

  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const loadingMessages = [
    "Iniciando la aplicación...",
    "Preparando el mapa...",
    "Cargando información del transporte...",
    "Todo listo."
  ];

  const [loadingText, setLoadingText] = useState(loadingMessages[0]);
  
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ImageBackground
        source={require("../../../assets/fondoH.webp")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Capa blanca */}
        <View style={styles.overlay} />

        {/* Contenido */}
        <View style={styles.content}>
          <View style={styles.headerContent}>

            <Image
              source={require("../../../assets/logoF.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>
              No vuelvas a preguntártelo
            </Text>

            <Text style={styles.description}>
              Encuentra la mejor ruta y el transporte{"\n"}
              ideal para llegar a tu destino
            </Text>
          </View>

          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
                {loadingText}
              </Text>

            <View style={styles.loadingBar}>
              <Animated.View
                style={[
                styles.loadingProgress,
                {
                  width,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  </>
);
}