import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
} from "react-native";

import colors from "../theme/colors";

const LOADING_MESSAGES = [
  "Iniciando la aplicación...",
  "Preparando el mapa...",
  "Cargando información del transporte...",
  "Todo listo.",
];

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const progress = useRef(new Animated.Value(0)).current;

  const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 2,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const textTimers = [
      setTimeout(() => setLoadingText(LOADING_MESSAGES[1]), 700),
      setTimeout(() => setLoadingText(LOADING_MESSAGES[2]), 1500),
      setTimeout(() => setLoadingText(LOADING_MESSAGES[3]), 2300),
    ];

    Animated.timing(progress, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: false,
    }).start(() => {
      navigation.replace("Home");
    });

    return () => textTimers.forEach(clearTimeout);
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ImageBackground
      source={require("../../assets/fondoH.webp")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Image
            source={require("../../assets/logoF.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          ¿Qué Tomo?
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          Tu guía inteligente para moverte por La Paz
        </Animated.Text>

        <View style={styles.loader}>
          <Animated.View
            style={[
              styles.loaderFill,
              {
                width: barWidth,
              },
            ]}
          />
        </View>

        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 30,
  },

  logo: {
    width: 180,
    height: 180,
  },

  title: {
    marginTop: 20,
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: colors.white,
    textAlign: "center",
    opacity: 0.95,
  },

  loader: {
    marginTop: 45,
    width: 220,
    height: 7,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    overflow: "hidden",
  },

  loaderFill: {
    height: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 10,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
});