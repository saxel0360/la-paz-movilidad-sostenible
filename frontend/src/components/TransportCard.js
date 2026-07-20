import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import colors from "../theme/colors";
import typography from "../theme/typography";
import spacing from "../theme/spacing";
import shadows from "../theme/shadows";

// ============================================
// Tarjeta de transporte reutilizable.
// Se usa en HomeScreen (menú) y en TransportModesScreen.
// accentColor: color propio de ese medio de transporte
// (debe coincidir con el color usado en el mapa/rutas real,
// ver src/constants/colors.js y los servicios en src/services/)
// ============================================
export default function TransportCard({
  icon,
  title,
  subtitle,
  accentColor = colors.primary,
  ready = true,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconWrapper, { backgroundColor: accentColor + "22" }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {!ready && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Próximamente</Text>
        </View>
      )}

      {ready && <View style={[styles.dot, { backgroundColor: accentColor }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.md,
    ...shadows.card,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 26,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});