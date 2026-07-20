import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from "react-native";

import { COLORS } from "../../constants/colors";
import RouteCard from "../components/RouteCard";
import { routes } from "../../data/routes";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/RouteResultsScreenStyle";

export default function RouteResultsScreen({ route, navigation }) {

    const { destination } = route.params || {};
    const [selectedTransport, setSelectedTransport] = useState(null);
    const selectedRoute = route.params?.selectedRoute;
    const [selectedPreference, setSelectedPreference] = useState(null);

    const filteredRoutes = routes.filter(route => {
        if (!selectedTransport) {
            return true;
        }
        return route.transportesUsados.includes(selectedTransport);
    });

    const sortedRoutes = [...filteredRoutes].sort((a, b) => {
        if (selectedPreference === "COSTO") {
            return a.costoTotal - b.costoTotal;
        }
        if (selectedPreference === "TIEMPO") {
            return a.tiempoEstimado - b.tiempoEstimado;
        }
        if (selectedPreference === "CAMINAR") {
            return a.distanciaCaminando - b.distanciaCaminando;
        }
        if (selectedPreference === "TRANSBORDOS") {
            return a.cantidadTransbordos - b.cantidadTransbordos;
        }
        return 0;
    });

    const isSelected = (transport) => {
        return selectedTransport === transport;
    };

    const handlePreferencePress = (preference) => {
        if (selectedPreference === preference) {
            setSelectedPreference(null);
        } else {
            setSelectedPreference(preference);
        }
    };

    const handleSelectRoute = (selectedRoute) => {
        console.log("Ruta seleccionada:", selectedRoute);
        navigation.navigate(
            "RoutePlanner",
            {
                selectedRoute
            }
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    Llegar a
                </Text>

                <Text style={styles.destination}>
                    📍 {destination}
                </Text>

                <Text style={styles.routesCount}>
                    {filteredRoutes.length} rutas disponibles
                </Text>
            </View>

            {/* FILTROS */}
            <View style={styles.filtersContainer}>
                <View style={styles.filterSection}>
                    <Text style={styles.filterTitle}>
                        Elige tu forma de moverte
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterRow}
                    >
                        <TouchableOpacity
                            style={
                                selectedTransport === null
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            onPress={() => setSelectedTransport(null)}
                        >
                            <Text style={
                                selectedTransport === null
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }>
                                Todos
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                isSelected("TRUFI")
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            onPress={() => setSelectedTransport("TRUFI")}
                        >
                            <Text style={
                                isSelected("TRUFI")
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }>
                                🚐 Trufi
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                isSelected("TELEFERICO")
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            onPress={() => setSelectedTransport("TELEFERICO")}
                        >
                            <Text style={
                                isSelected("TELEFERICO")
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }>
                                🚡 Teleférico
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                isSelected("PUMAKATARI")
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            onPress={() => setSelectedTransport("PUMAKATARI")}
                        >
                            <Text style={
                                isSelected("PUMAKATARI")
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }>
                                🚌 Puma
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                isSelected("MINIBUS")
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            onPress={() => setSelectedTransport("MINIBUS")}
                        >
                            <Text style={
                                isSelected("MINIBUS")
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }>
                                🚐 Minibús
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                isSelected("MICRO")
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            onPress={() => setSelectedTransport("MICRO")}
                        >
                            <Text style={
                                isSelected("MICRO")
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }>
                                🚌 Micro
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <View style={styles.filterSection}>
                    <Text style={styles.filterTitle}>
                        Preferencias de viaje
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterRow}
                    >
                        <TouchableOpacity
                            style={
                                selectedPreference === "CAMINAR"
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            onPress={() => handlePreferencePress("CAMINAR")}
                        >
                            <Text style={
                                selectedPreference === "CAMINAR"
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }>
                                🚶 Menos caminar
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                selectedPreference === "COSTO"
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            onPress={() => handlePreferencePress("COSTO")}
                        >
                            <Text style={
                                selectedPreference === "COSTO"
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }>
                                💰 Menor costo
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                selectedPreference === "TRANSBORDOS"
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            onPress={() => handlePreferencePress("TRANSBORDOS")}
                        >
                            <Text style={
                                selectedPreference === "TRANSBORDOS"
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }>
                                🔄 Menos transbordos
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                selectedPreference === "TIEMPO"
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            onPress={() => handlePreferencePress("TIEMPO")}
                        >
                            <Text style={
                                selectedPreference === "TIEMPO"
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }>
                                ⚡ Más rápido
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>

            {/* LISTA DE RUTAS */}
            <ScrollView
                style={styles.routesContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.routesContent}
            >
                {sortedRoutes.length > 0 ? (
                    sortedRoutes.map((item) => (
                        <RouteCard
                            key={item.id}
                            route={item}
                            onSelectRoute={handleSelectRoute}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateEmoji}>🚫</Text>
                        <Text style={styles.emptyStateTitle}>
                            No hay rutas disponibles
                        </Text>
                        <Text style={styles.emptyStateSubtitle}>
                            No encontramos rutas con el filtro seleccionado.
                            Intenta con otro filtro.
                        </Text>
                    </View>
                )}
            </ScrollView>

        </SafeAreaView>
    );
}