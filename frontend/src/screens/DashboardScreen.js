import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

import colors from "../theme/colors";
import typography from "../theme/typography";
import spacing from "../theme/spacing";
import shadows from "../theme/shadows";
import IncidentMap from "../components/IncidentMap";

const RESUMEN = [
  { label: "Bloqueos", value: "7", icon: "🚧" },
  { label: "Reportes", value: "42", icon: "📋" },
  { label: "Zona crítica", value: "El Alto", icon: "📍" },
  { label: "Usuarios", value: "218", icon: "👥" },
];

const ALERTAS = [
  "Bloqueo en Av. Mariscal Santa Cruz",
  "Manifestación en Plaza San Francisco",
];

const BLOQUEOS = [
  { zona: "El Alto", cantidad: 14 },
  { zona: "Zona Sur", cantidad: 9 },
  { zona: "Centro", cantidad: 8 },
  { zona: "Sopocachi", cantidad: 5 },
  { zona: "Villa Fátima", cantidad: 4 },
];

const TRANSPORTE = [
  {
    nombre: "Minibús",
    porcentaje: 38,
    color: "#2F6690",
  },
  {
    nombre: "Teleférico",
    porcentaje: 27,
    color: "#6D9F71",
  },
  {
    nombre: "PumaKatari",
    porcentaje: 19,
    color: "#C97A4A",
  },
  {
    nombre: "Trufi",
    porcentaje: 16,
    color: "#8B5CF6",
  },
];

const CONFIANZA = [
  {
    linea: "Línea Roja",
    nivel: "Alta",
    color: colors.accent,
  },
  {
    linea: "Ruta 44",
    nivel: "Media",
    color: colors.secondary,
  },
  {
    linea: "PumaKatari",
    nivel: "Alta",
    color: colors.accent,
  },
  {
    linea: "Ruta 22",
    nivel: "Baja",
    color: colors.error,
  },
];

const max = Math.max(...BLOQUEOS.map((i) => i.cantidad));

export default function DashboardScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Dashboard Municipal
      </Text>

      <Text style={styles.subtitle}>
        Monitoreo de movilidad urbana
      </Text>


      <View style={styles.summaryGrid}>
        {RESUMEN.map((item) => (
          <View
            key={item.label}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryIcon}>
              {item.icon}
            </Text>

            <Text style={styles.summaryValue}>
              {item.value}
            </Text>

            <Text style={styles.summaryLabel}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Alertas */}

      <Text style={styles.sectionTitle}>
        Alertas activas
      </Text>

      <View style={styles.card}>
        {ALERTAS.map((item) => (
          <Text
            key={item}
            style={styles.alert}
          >
            ⚠️ {item}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
🗺️ Mapa de incidentes
</Text>

<View style={styles.card}>
    <IncidentMap/>
</View>

      {/* Bloqueos */}

      <Text style={styles.sectionTitle}>
        Bloqueos por zona
      </Text>

      <View style={styles.card}>
        {BLOQUEOS.map((item) => (
          <View
            key={item.zona}
            style={styles.barRow}
          >
            <Text style={styles.barLabel}>
              {item.zona}
            </Text>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${(item.cantidad / max) * 100}%`,
                    backgroundColor:
                      colors.secondary,
                  },
                ]}
              />
            </View>

            <Text style={styles.barValue}>
              {item.cantidad}
            </Text>
          </View>
        ))}
      </View>

      {/* Transporte */}

      <Text style={styles.sectionTitle}>
        Uso del transporte
      </Text>

      <View style={styles.card}>
        {TRANSPORTE.map((item) => (
          <View
            key={item.nombre}
            style={styles.barRow}
          >
            <Text style={styles.barLabel}>
              {item.nombre}
            </Text>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${item.porcentaje}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>

            <Text style={styles.barValue}>
              {item.porcentaje}%
            </Text>
          </View>
        ))}
      </View>

      {/* Confianza */}

      <Text style={styles.sectionTitle}>
        Índice de confianza
      </Text>

      <View style={styles.card}>
        {CONFIANZA.map((item) => (
          <View
            key={item.linea}
            style={styles.confRow}
          >
            <Text style={styles.confLabel}>
              {item.linea}
            </Text>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    item.color + "22",
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: item.color,
                  },
                ]}
              >
                {item.nivel}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Datos simulados para la demostración.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:colors.background
  },

  content:{
    padding:spacing.lg,
    paddingBottom:50
  },

  title:{
    fontSize:28,
    fontWeight:"700",
    color:colors.primary
  },

  subtitle:{
    color:colors.textLight,
    marginBottom:20
  },

  statusCard:{
    backgroundColor:colors.white,
    borderRadius:18,
    padding:18,
    marginBottom:20,
    ...shadows.card
  },

  statusTitle:{
    fontSize:18,
    fontWeight:"700",
    color:colors.primary
  },

  statusText:{
    fontSize:22,
    fontWeight:"700",
    marginTop:8,
    color:colors.text
  },

  update:{
    marginTop:12,
    color:colors.textLight
  },

  time:{
    fontWeight:"700",
    color:colors.primary
  },

  summaryGrid:{
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"space-between"
  },

  summaryCard:{
    width:"48%",
    backgroundColor:colors.white,
    borderRadius:18,
    padding:18,
    marginBottom:15,
    ...shadows.card
  },

  summaryIcon:{fontSize:25},

  summaryValue:{
    fontSize:28,
    fontWeight:"700",
    color:colors.primary
  },

  summaryLabel:{
    color:colors.textLight
  },

  sectionTitle:{
    marginTop:10,
    marginBottom:10,
    fontSize:18,
    fontWeight:"700",
    color:colors.text
  },

  card:{
    backgroundColor:colors.white,
    borderRadius:18,
    padding:16,
    marginBottom:20,
    ...shadows.card
  },

  alert:{
    marginBottom:10,
    color:colors.text
  },

  mapCard:{
    backgroundColor:colors.white,
    borderRadius:18,
    padding:25,
    alignItems:"center",
    marginBottom:20,
    ...shadows.card
  },

  mapEmoji:{
    fontSize:70
  },

  mapTitle:{
    fontSize:18,
    fontWeight:"700",
    marginTop:10
  },

  mapSubtitle:{
    textAlign:"center",
    color:colors.textLight,
    marginTop:6
  },

  barRow:{
    flexDirection:"row",
    alignItems:"center",
    marginBottom:12
  },

  barLabel:{
    width:100,
    fontWeight:"600"
  },

  track:{
    flex:1,
    height:10,
    backgroundColor:colors.border,
    borderRadius:10,
    overflow:"hidden",
    marginHorizontal:10
  },

  fill:{
    height:10,
    borderRadius:10
  },

  barValue:{
    width:35,
    textAlign:"right"
  },

  confRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:10
  },

  confLabel:{
    flex:1
  },

  badge:{
    borderRadius:12,
    paddingHorizontal:12,
    paddingVertical:5
  },

  badgeText:{
    fontWeight:"700"
  },

  footer:{
    textAlign:"center",
    color:colors.textLight,
    marginTop:10,
    fontStyle:"italic"
  }
});