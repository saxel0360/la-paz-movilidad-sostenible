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

import RecentTrips from "../ruteo/components/RecentTrips";

const QUICK_LINKS = [
  {
    key: "transporte",
    icon: "🚌",
    title: "Medios",
    screen: "TransportModes",
    ready: true,
  },
  {
    key: "dashboard",
    icon: "📊",
    title: "Dashboard",
    screen: "Dashboard",
    ready: true,
  },
  {
    key: "paradas",
    icon: "📍",
    title: "Paradas",
    screen: "SmartStops",
    ready: true,
  },
  {
    key: "incidente",
    icon: "⚠️",
    title: "Reportar",
    screen: "ReportarIncidente",
    ready: false,
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const goToSearch = () => navigation.navigate("DestinationSearch");

  const handleQuickLink = (item) => {
    if (item.ready) {
      navigation.navigate(item.screen);
    } else {
      navigation.navigate("ComingSoon", { title: item.title });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* Buscador — protagonista de la pantalla.*/}
      <Text style={styles.searchLabel}>¿A dónde quieres ir?</Text>

      <TouchableOpacity
        style={styles.searchBox}
        activeOpacity={0.8}
        onPress={goToSearch}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Buscar destino</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.locationLink}
        activeOpacity={0.7}
        onPress={goToSearch}
      >
        <Text style={styles.locationText}>📍 Usar mi ubicación</Text>
      </TouchableOpacity>

      {/* Accesos rápidos */}
      <Text style={styles.sectionTitle}>Accesos rápidos</Text>

      <View style={styles.quickRow}>
        {QUICK_LINKS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.quickItem}
            activeOpacity={0.8}
            onPress={() => handleQuickLink(item)}
          >
            <View style={styles.quickIconWrapper}>
              <Text style={styles.quickIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.quickLabel}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Viajes recientes (componente compartido con el módulo de ruteo) */}
      <Text style={styles.sectionTitle}>Viajes recientes</Text>
      <RecentTrips scrollEnabled={false} />
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
    width: 110,
    height: 110,
    alignSelf: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  title: {
    fontSize: typography.title,
    fontWeight: "700",
    textAlign: "center",
    color: colors.primary,
    marginBottom: spacing.lg,
  },

  searchLabel: {
    fontSize: typography.subheading,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadows.card,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },

  searchPlaceholder: {
    fontSize: typography.body,
    color: colors.textLight,
  },

  locationLink: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  locationText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },

  quickItem: {
    alignItems: "center",
    width: "23%",
  },

  quickIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    ...shadows.card,
  },

  quickIcon: {
    fontSize: 24,
  },

  quickLabel: {
    fontSize: typography.small,
    color: colors.text,
    fontWeight: "600",
    textAlign: "center",
  },
});