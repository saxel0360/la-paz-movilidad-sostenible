import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/RoutePlannerStyles';

export const RouteSummary = ({ route, selectedTestCase }) => {
    if (!route) return null;

    return (
        <View style={styles.routeSummary}>
            <View style={styles.routeHeader}>
                <Text style={styles.routeTitle}>🚐 Ruta Multimodal</Text>
                {selectedTestCase && (
                    <View style={styles.testCaseBadge}>
                        <Text style={styles.testCaseBadgeText}>
                            {selectedTestCase.modo}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.routeStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🕐</Text>
                    <Text style={styles.statText}>{route.resumen.duracion_total} min</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>📏</Text>
                    <Text style={styles.statText}>{route.resumen.distancia_total} km</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🔄</Text>
                    <Text style={styles.statText}>{route.resumen.transbordos} transbordos</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>💰</Text>
                    <Text style={styles.statText}>Bs {route.resumen.costo_estimado}</Text>
                </View>
            </View>
        </View>
    );
};

export default RouteSummary;