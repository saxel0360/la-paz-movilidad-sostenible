import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import colors from "../theme/colors";
import typography from "../theme/typography";
import spacing from "../theme/spacing";
import shadows from "../theme/shadows";

// ============================================
// MENÚ PRINCIPAL
// Cada entrada define a qué pantalla navega.
// "ready: true"  -> ya está construida por el equipo (navega directo)
// "ready: false" -> aún no existe; muestra aviso "Próximamente"
// ============================================
const MENU_ITEMS = [
  {
    key: "rutas",
    icon: "🗺️",
    title: "Planificar Ruta",
    subtitle: "Rutas alternativas y bloqueos en tiempo real",
    screen: "RoutePlanner",
    ready: true,
  },
  {
    key: "paradas",
    icon: "📍",
    title: "Paradas Inteligentes",
    subtitle: "Encuentra la parada más cercana",
    screen: "Paradas",
    ready: false,
  },
  {
    key: "dashboard",
    icon: "📊",
    title: "Dashboard Municipal",
    subtitle: "Estadísticas de bloqueos y transporte",
    screen: "Dashboard",
    ready: false,
  },
  {
    key: "transporte",
    icon: "🚌",
    title: "Medios de Transporte Disponibles",
    subtitle: "Minibús, Teleférico, PumaKatari y más",
    screen: "TransportModes",
    ready: true,
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const handlePress = (item) => {
    if (item.ready) {
      navigation.navigate(item.screen);
    } else {
      // Placeholder amigable mientras el resto del equipo construye la pantalla
      navigation.navigate("ComingSoon", { title: item.title });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Título */}
      <Text style={styles.title}>¿Qué Tomo?</Text>

      {/* Eslogan */}
      <Text style={styles.subtitle}>
        Para moverte en La Paz,{"\n"}
        no para irte de fiesta.
      </Text>

      {/* Menú principal */}
      <Text style={styles.sectionTitle}>Menú</Text>

      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => handlePress(item)}
          >
            <View style={styles.menuIconWrapper}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>

            <View style={styles.menuTextWrapper}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>

            {!item.ready && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Próximamente</Text>
              </View>
            )}
          </TouchableOpacity>
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

  logo: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  title: {
    fontSize: typography.title,
    fontWeight: "700",
    textAlign: "center",
    color: colors.primary,
  },

  subtitle: {
    fontSize: typography.body,
    textAlign: "center",
    color: colors.textLight,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },

  menuContainer: {
    gap: spacing.md,
  },

  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.md,
    ...shadows.card,
  },

  menuIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  menuIcon: {
    fontSize: 26,
  },

  menuTextWrapper: {
    flex: 1,
  },

  menuTitle: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },

  menuSubtitle: {
    fontSize: typography.small,
    color: colors.textLight,
    marginTop: 2,
  },

  badge: {
    backgroundColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textLight,
  },
});