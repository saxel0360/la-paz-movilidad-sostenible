import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from '../styles/RoutePlannerStyles';
import { COLORS } from '../../constants/colors';

export const BlockSimulation = ({
    isBlocked,
    blockLocation,
    isRecalculating,
    BLOCK_POINTS,
    startBlockSimulation,
    stopBlockSimulation,
}) => {
    return (
        <View style={styles.simulationControls}>
            <Text style={styles.simulationTitle}>🚧 Simulación de Bloqueos</Text>
            <View style={styles.simulationButtons}>
                <TouchableOpacity
                    style={[styles.simButton, styles.simButtonBlock]}
                    onPress={() => {
                        const keys = Object.keys(BLOCK_POINTS);
                        const randomKey = keys[Math.floor(Math.random() * keys.length)];
                        startBlockSimulation(BLOCK_POINTS[randomKey]);
                    }}
                    disabled={isBlocked || isRecalculating}
                >
                    <Text style={styles.simButtonText}>
                        {isBlocked ? '🚧 Bloqueo Activo' : '🚧 Simular Bloqueo'}
                    </Text>
                </TouchableOpacity>

                {isBlocked && (
                    <TouchableOpacity
                        style={[styles.simButton, styles.simButtonClear]}
                        onPress={stopBlockSimulation}
                    >
                        <Text style={styles.simButtonText}>✅ Limpiar Bloqueo</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isRecalculating && (
                <View style={styles.recalculatingContainer}>
                    <ActivityIndicator size="small" color={COLORS.WARNING} />
                    <Text style={styles.recalculatingText}>🔄 Recalculando ruta...</Text>
                </View>
            )}

            {blockLocation && (
                <View style={styles.blockInfo}>
                    <Text style={styles.blockText}>
                        ⚠️ Bloqueo en: {blockLocation.nombre}
                    </Text>
                    <Text style={styles.blockDesc}>
                        {blockLocation.descripcion}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default BlockSimulation;