import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import colors from "../theme/colors";
import typography from "../theme/typography";
import spacing from "../theme/spacing";
import TransportCard from "../components/TransportCard";

// ============================================
// Medios de transporte disponibles.
// "ready: true"  -> ya tiene datos reales de ruta en frontend/src/services/
//                   (minibusRoutes.js, telefericoRoutes.js, pumakatariRoutes.js)
// "ready: false" -> todavía no hay datos de ruta; se muestra como anuncio.
//
// Los colores (accentColor) están tomados de esos mismos servicios
// para que el color de la tarjeta coincida con el color de la línea
// en el mapa de RoutePlannerScreen.
// ============================================
const TRANSPORT_MODES = [
  {
    key: "minibus",
    icon: "🚐",
    title: "Minibús",
    subtitle: "Rutas 44, 22 y 33 · Bs 2.50",
    accentColor: "#007AFF",
    ready: true,
  },
  {
    key: "teleferico",
    icon: "🚠",
    title: "Mi Teleférico",
    subtitle: "Líneas Morada, Amarilla y Roja · Bs 3.00",
    accentColor: "#9B59B6",
    ready: true,
  },
  {
    key: "pumakatari",
    icon: "🚌",
    title: "PumaKatari",
    subtitle: "Línea Verde · Bs 2.00",
    accentColor: "#34C759",
    ready: true,
  },
  {
    key: "trufi",
    icon: "🚖",
    title: "Trufi",
    subtitle: "Transporte compartido",
    accentColor: "#AF52DE",
    ready: false,
  },
];

export default function TransportModesScreen() {
  const navigation = useNavigation();

  const handlePress = (mode) => {
    if (mode.ready) {
      // Todas las líneas activas comparten el mismo planificador de rutas;
      // ahí el usuario ya puede elegir origen/destino y ver esa línea en el mapa.
      navigation.navigate("RoutePlanner");
    } else {
      navigation.navigate("ComingSoon", { title: mode.title });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Medios de Transporte</Text>
      <Text style={styles.subtitle}>
        Elige un medio para ver sus rutas en el mapa
      </Text>

      <View style={styles.list}>
        {TRANSPORT_MODES.map((mode) => (
          <TransportCard
            key={mode.key}
            icon={mode.icon}
            title={mode.title}
            subtitle={mode.subtitle}
            accentColor={mode.accentColor}
            ready={mode.ready}
            onPress={() => handlePress(mode)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: "700",
    color: colors.primary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textLight,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
});