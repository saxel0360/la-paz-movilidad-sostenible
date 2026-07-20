import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const EventMonitorPanel = ({
    monitorEnabled,
    setMonitorEnabled,
    activeEvent,
    trafficEvents,
    eventHistory,
    simulateEventById,
    clearActiveEvent,
}) => {
    return (
        <View style={localStyles.container}>
            <View style={localStyles.header}>
                <Text style={localStyles.title}>🧠 Motor de eventos</Text>

                <TouchableOpacity
                    style={[
                        localStyles.statusBadge,
                        monitorEnabled ? localStyles.badgeActive : localStyles.badgeInactive,
                    ]}
                    onPress={() => setMonitorEnabled(!monitorEnabled)}
                >
                    <Text style={localStyles.statusText}>
                        {monitorEnabled ? 'Activo' : 'Pausado'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={localStyles.description}>
                Simula marchas, bloqueos o trancaderas para demostrar el recálculo inteligente de rutas.
            </Text>

            {activeEvent && (
                <View style={[localStyles.activeEvent, { borderLeftColor: activeEvent.color }]}>
                    <Text style={localStyles.activeTitle}>
                        {activeEvent.icono} Evento activo: {activeEvent.nombre}
                    </Text>
                    <Text style={localStyles.activeDescription}>
                        {activeEvent.descripcion}
                    </Text>
                    <Text style={localStyles.activeMeta}>
                        Severidad: {activeEvent.severidad} · Zona: {activeEvent.zona}
                    </Text>

                    <TouchableOpacity
                        style={localStyles.clearButton}
                        onPress={clearActiveEvent}
                    >
                        <Text style={localStyles.clearButtonText}>Limpiar evento visual</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={localStyles.eventsScroll}
            >
                {trafficEvents.map((event) => (
                    <TouchableOpacity
                        key={event.id}
                        style={[localStyles.eventButton, { borderColor: event.color }]}
                        onPress={() => simulateEventById(event.id)}
                    >
                        <Text style={localStyles.eventIcon}>{event.icono}</Text>
                        <Text style={localStyles.eventName}>{event.nombre}</Text>
                        <Text style={localStyles.eventType}>{event.tipo}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {eventHistory.length > 0 && (
                <View style={localStyles.history}>
                    <Text style={localStyles.historyTitle}>Historial de eventos</Text>

                    {eventHistory.slice(0, 3).map((item) => (
                        <View key={item.id} style={localStyles.historyItem}>
                            <Text style={localStyles.historyText}>
                                {item.fecha} · {item.nombre}
                            </Text>
                            <Text style={localStyles.historyAction}>
                                {item.accion}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        marginTop: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
    },
    description: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    badgeActive: {
        backgroundColor: '#DCFCE7',
    },
    badgeInactive: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#111827',
    },
    activeEvent: {
        borderLeftWidth: 5,
        backgroundColor: '#FFF7ED',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
    },
    activeTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#111827',
    },
    activeDescription: {
        marginTop: 4,
        fontSize: 12,
        color: '#374151',
    },
    activeMeta: {
        marginTop: 4,
        fontSize: 11,
        color: '#6B7280',
    },
    clearButton: {
        marginTop: 8,
        backgroundColor: '#111827',
        borderRadius: 8,
        paddingVertical: 7,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    eventsScroll: {
        marginTop: 4,
    },
    eventButton: {
        width: 135,
        minHeight: 92,
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 10,
        marginRight: 10,
        backgroundColor: '#F9FAFB',
    },
    eventIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    eventName: {
        fontSize: 12,
        fontWeight: '800',
        color: '#111827',
    },
    eventType: {
        marginTop: 4,
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '700',
    },
    history: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    },
    historyTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 6,
    },
    historyItem: {
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 8,
        marginBottom: 6,
    },
    historyText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#111827',
    },
    historyAction: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 2,
    },
});

export default EventMonitorPanel;