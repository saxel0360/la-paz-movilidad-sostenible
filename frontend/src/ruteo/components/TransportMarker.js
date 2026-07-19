import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * Marcador dinámico que cambia según el medio de transporte
 */
export const TransportMarker = ({ 
    type, 
    size = 50, 
    isActive = true,
    pulse = false,
}) => {
    // Obtener icono y color según tipo
    const getMarkerInfo = () => {
        const info = {
            'WALK': { icon: '🚶', color: COLORS.WALK, label: 'Caminando' },
            'TELEFERICO': { icon: '🚠', color: '#F1C40F', label: 'Teleférico' },
            'MINIBUS': { icon: '🚐', color: '#007AFF', label: 'Minibús' },
            'PUMAKATARI': { icon: '🚌', color: '#34C759', label: 'PumaKatari' },
            'MIXTO': { icon: '🚌', color: '#FF6B00', label: 'Transporte' },
        };
        return info[type] || info['WALK'];
    };

    const markerInfo = getMarkerInfo();

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View 
                style={[
                    styles.marker, 
                    { 
                        backgroundColor: markerInfo.color,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    }
                ]}
            >
                <Text style={[styles.icon, { fontSize: size * 0.5 }]}>
                    {markerInfo.icon}
                </Text>
                {pulse && (
                    <View style={[styles.pulse, {
                        width: size * 1.5,
                        height: size * 1.5,
                        borderRadius: size * 0.75,
                    }]} />
                )}
            </View>
            <View style={styles.labelContainer}>
                <Text style={styles.labelText}>{markerInfo.label}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    marker: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
    },
    icon: {
        fontWeight: 'bold',
    },
    pulse: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        zIndex: -1,
    },
    labelContainer: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 4,
        position: 'absolute',
        bottom: -22,
    },
    labelText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
});