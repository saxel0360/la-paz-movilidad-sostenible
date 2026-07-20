import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../../constants/colors';

import { SearchBar } from '../components/SearchBar';
import QuickAccess from '../components/QuickAccess';
import RecentTrips from '../components/RecentTrips';
import RouteSearchCard from '../components/RouteSearchCard';

export default function DestinationSearch({ navigation }) {
    const handleDestination = (place) => {
        console.log(place);
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    ¿A dónde vamos hoy?
                </Text>

                <Text style={styles.subtitle}>
                    ¿QUÉ TOMO? encuentra la mejor ruta para tu destino.
                </Text>
            </View>

            {/* TARJETA DE BÚSQUEDA */}
            <View style={styles.searchCard}>
                <RouteSearchCard
                    onSearch={(destination) =>
                        navigation.navigate("RouteResults", {
                            destination,
                        })
                    }
                />
            </View>

            {/* ACCESOS RÁPIDOS */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Accesos rápidos
                </Text>

                <QuickAccess />
            </View>

            {/* RUTAS RECIENTES */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Rutas recientes
                </Text>

                <RecentTrips
                    navigation={navigation}
                />
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
        padding: 22,
    },

    header: {
        marginTop: 18,
        marginBottom: 15,
        alignSelf: 'stretch',
    },

    title: {
        fontSize: 30,
        fontWeight: '900',
        color: COLORS.ANDEAN_BLUE,
        lineHeight: 70,
    },

    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        color: COLORS.TEXT_SECONDARY,

        flexShrink: 1,
    },

    searchCard: {
        backgroundColor: COLORS.SURFACE,

        borderRadius: 24,

        borderWidth: 1,
        borderColor: COLORS.BORDER,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,

        marginBottom: 30,
    },

    section: {
        marginBottom: 30,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,

        color: COLORS.TEXT_SECONDARY,

        marginBottom: 16,
        marginLeft: 4,
    },

});