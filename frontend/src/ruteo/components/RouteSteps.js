import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from '../styles/RoutePlannerStyles';

export const RouteSteps = ({ route }) => {
    if (!route) return null;

    const getTransportInfo = (tramo) => {
        let icon = '🚶';
        let tipoDisplay = 'Caminata';

        if (tramo.tipo === 'TELEFERICO') {
            icon = '🚠';
            tipoDisplay = 'Teleférico';
        } else if (tramo.tipo === 'MINIBUS') {
            icon = '🚐';
            tipoDisplay = 'Minibús';
        } else if (tramo.tipo === 'PUMAKATARI') {
            icon = '🚌';
            tipoDisplay = 'PumaKatari';
        } else if (tramo.tipo === 'WALK') {
            icon = '🚶';
            tipoDisplay = 'Caminata';
        }

        return { icon, tipoDisplay };
    };

    return (
        <ScrollView
            style={styles.stepsContainer}
            showsVerticalScrollIndicator={false}
        >
            {route.tramos.map((tramo, index) => {
                const { icon, tipoDisplay } = getTransportInfo(tramo);

                return (
                    <View key={tramo.id} style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>{index + 1}</Text>
                        </View>
                        <View style={[styles.stepBadge, { backgroundColor: tramo.color }]}>
                            <Text style={styles.stepBadgeText}>{icon}</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <View style={styles.stepHeader}>
                                <Text style={styles.stepTitle}>
                                    {tramo.nombre}
                                </Text>
                                <Text style={styles.stepTypeBadge}>
                                    {tipoDisplay}
                                </Text>
                            </View>
                            <Text style={styles.stepInstruction} numberOfLines={2}>
                                {tramo.instrucciones}
                            </Text>
                            <View style={styles.stepMeta}>
                                <Text style={styles.stepMetaText}>⏱️ {tramo.duracion} min</Text>
                                <Text style={styles.stepMetaText}>📏 {tramo.distancia} km</Text>
                                {tramo.costo && (
                                    <Text style={styles.stepMetaText}>💰 Bs {tramo.costo}</Text>
                                )}
                            </View>
                            {tramo.paradas && tramo.paradas.length > 0 && (
                                <View style={styles.stepParadasContainer}>
                                    <Text style={styles.stepParadasLabel}>🚏 Paradas:</Text>
                                    <Text style={styles.stepParadas} numberOfLines={2}>
                                        {tramo.paradas.join(' → ')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
};

export default RouteSteps;