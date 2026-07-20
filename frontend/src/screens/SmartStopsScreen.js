import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";

import SmartStopCard from "../components/SmartStopCard";
import SMART_STOPS from "../data/smartStopsMock";

import colors from "../theme/colors";
import typography from "../theme/typography";
import spacing from "../theme/spacing";

export default function SmartStopsScreen() {

  const [search, setSearch] = useState("");

  const filteredStops = useMemo(() => {
    return SMART_STOPS.filter((stop) =>
      stop.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const operando = SMART_STOPS.filter(
    s => s.estado === "Operando"
  ).length;

  const congestion = SMART_STOPS.filter(
    s => s.estado === "Congestionada"
  ).length;

  const saturada = SMART_STOPS.filter(
    s => s.estado === "Saturada"
  ).length;

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.title}>
        🚏 Paradas Inteligentes
      </Text>

      <Text style={styles.subtitle}>
        Consulta el estado de las principales paradas de transporte público.
      </Text>

      <TextInput
        placeholder="Buscar parada..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {filteredStops.map((stop) => (

        <SmartStopCard
          key={stop.id}
          stop={stop}
        />

      ))}

      <Text style={styles.section}>
        Resumen
      </Text>

      <View style={styles.summary}>

        <View style={styles.box}>
          <Text style={styles.number}>{operando}</Text>
          <Text style={styles.label}>🟢 Operando</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.number}>{congestion}</Text>
          <Text style={styles.label}>🟡 Congestionadas</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.number}>{saturada}</Text>
          <Text style={styles.label}>🔴 Saturadas</Text>
        </View>

      </View>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:colors.background,
  },

  content:{
    padding:spacing.lg,
    paddingBottom:40,
  },

  title:{
    fontSize:30,
    fontWeight:"700",
    color:colors.primary,
    marginTop:spacing.md,
  },

  subtitle:{
    marginTop:8,
    marginBottom:20,
    color:colors.textLight,
    fontSize:typography.body,
  },

  search:{
    backgroundColor:colors.white,
    borderRadius:15,
    padding:15,
    marginBottom:20,
    borderWidth:1,
    borderColor:colors.border,
  },

  section:{
    fontSize:20,
    fontWeight:"700",
    color:colors.text,
    marginTop:10,
    marginBottom:15,
  },

  summary:{
    flexDirection:"row",
    justifyContent:"space-between",
  },

  box:{
    width:"31%",
    backgroundColor:colors.white,
    borderRadius:16,
    alignItems:"center",
    padding:15,
    elevation:2,
  },

  number:{
    fontSize:28,
    fontWeight:"700",
    color:colors.primary,
  },

  label:{
    marginTop:8,
    textAlign:"center",
    fontSize:12,
    color:colors.text,
  },

});