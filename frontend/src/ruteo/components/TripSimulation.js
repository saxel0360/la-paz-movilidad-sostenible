import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/RoutePlannerStyles';

export const TripSimulation = ({
    route,
    isTripActive,
    isTripComplete,
    tripProgress,
    currentTransport,
    currentInstruction,
    elapsedTime,
    handleStartTrip,
    pauseTrip,
    resumeTrip,
    stopTrip,
    setShowTripControls,
}) => {
    return (
        <View style={styles.tripControls}>
            <TouchableOpacity
                style={[styles.tripButton, styles.tripButtonStart]}
                onPress={handleStartTrip}
                disabled={isTripActive || isTripComplete || !route}
            >
                <Text style={styles.tripButtonText}>
                    🚀 {isTripComplete ? 'Viaje Completado' : 'Simular Viaje'}
                </Text>
            </TouchableOpacity>

            {isTripActive && (
                <View style={styles.tripStatus}>
                    <View style={styles.tripProgress}>
                        <View style={[styles.tripProgressFill, { width: `${tripProgress}%` }]} />
                        <Text style={styles.tripProgressText}>
                            {Math.round(tripProgress)}%
                        </Text>
                    </View>
                    <View style={styles.tripInfo}>
                        <Text style={styles.tripInfoText}>
                            🚌 {currentTransport || 'Caminata'}
                        </Text>
                        <Text style={styles.tripInfoText}>
                            ⏱️ {elapsedTime}s
                        </Text>
                        <Text style={styles.tripInfoText} numberOfLines={1}>
                            {currentInstruction || 'En camino...'}
                        </Text>
                    </View>
                    <View style={styles.tripControlsRow}>
                        <TouchableOpacity
                            style={[styles.tripControlBtn, styles.tripPauseBtn]}
                            onPress={pauseTrip}
                        >
                            <Text style={styles.tripControlText}>⏸ Pausar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tripControlBtn, styles.tripResumeBtn]}
                            onPress={resumeTrip}
                        >
                            <Text style={styles.tripControlText}>▶ Reanudar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tripControlBtn, styles.tripStopBtn]}
                            onPress={() => {
                                stopTrip();
                                setShowTripControls(false);
                            }}
                        >
                            <Text style={styles.tripControlText}>⏹ Detener</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

export default TripSimulation;