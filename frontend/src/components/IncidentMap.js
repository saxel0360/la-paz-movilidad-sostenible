import React from "react";
import { StyleSheet } from "react-native";

import MapView, { Marker } from "react-native-maps";

import INCIDENTES from "../data/incidentesMock";

export default function IncidentMap() {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: -16.5000,
        longitude: -68.1500,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
    >
      {INCIDENTES.map((item) => (
        <Marker
          key={item.id}
          coordinate={{
            latitude: item.latitude,
            longitude: item.longitude,
          }}
          pinColor={item.color}
          title={item.tipo}
          description={`${item.descripcion}\n${item.zona}`}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 260,
    borderRadius: 20,
  },
});