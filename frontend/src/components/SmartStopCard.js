import React from "react";
import {
  View,
 Text,
 StyleSheet,
} from "react-native";

import colors from "../theme/colors";
import spacing from "../theme/spacing";
import typography from "../theme/typography";
import shadows from "../theme/shadows";

export default function SmartStopCard({ stop }) {
  return (
    <View style={styles.card}>

      {/* Nombre */}
      <Text style={styles.name}>
        📍 {stop.nombre}
      </Text>

      {/* Estado */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: stop.color + "22",
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color: stop.color,
            },
          ]}
        >
          ● {stop.estado}
        </Text>
      </View>

      {/* Llegadas */}
      <Text style={styles.sectionTitle}>
        Próximas llegadas
      </Text>

      {stop.lineas.map((linea, index) => (
        <View
          key={index}
          style={styles.lineRow}
        >
          <Text style={styles.lineName}>
            🚌 {linea.nombre}
          </Text>

          <Text style={styles.lineTime}>
            {linea.tiempo}
          </Text>
        </View>
      ))}

      {/* Ocupación */}
      <Text style={styles.sectionTitle}>
        Ocupación
      </Text>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${stop.ocupacion}%`,
              backgroundColor: stop.color,
            },
          ]}
        />
      </View>

      <Text style={styles.percent}>
        {stop.ocupacion}%
      </Text>

      {/* Información adicional */}
      <View style={styles.infoRow}>
        <Text>
          {stop.accesible ? "♿ Accesible" : "❌ Sin acceso"}
        </Text>

        <Text>
          🕒 {stop.actualizacion}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  card:{
    backgroundColor:colors.white,
    borderRadius:18,
    padding:spacing.md,
    marginBottom:spacing.lg,
    ...shadows.card
  },

  name:{
    fontSize:typography.subheading,
    fontWeight:"700",
    color:colors.text
  },

  badge:{
    alignSelf:"flex-start",
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:12,
    marginTop:spacing.sm,
    marginBottom:spacing.md,
  },

  badgeText:{
    fontWeight:"700",
    fontSize:13,
  },

  sectionTitle:{
    fontWeight:"700",
    color:colors.text,
    marginBottom:6,
    marginTop:10,
  },

  lineRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:6,
  },

  lineName:{
    color:colors.text,
  },

  lineTime:{
    fontWeight:"700",
    color:colors.primary,
  },

  progressBackground:{
    height:10,
    borderRadius:8,
    backgroundColor:colors.border,
    overflow:"hidden",
    marginTop:5,
  },

  progressFill:{
    height:10,
    borderRadius:8,
  },

  percent:{
    alignSelf:"flex-end",
    marginTop:5,
    fontWeight:"700",
    color:colors.textLight,
  },

  infoRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:spacing.md,
  }

});