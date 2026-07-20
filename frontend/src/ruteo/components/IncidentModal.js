import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

import styles from '../styles/RoutePlannerStyles';

const INCIDENTS = [
    {
        id: 'traffic',
        icon: '🚦',
        title: 'Congestión vehicular',
    },
    {
        id: 'block',
        icon: '🚧',
        title: 'Bloqueo vial',
    },
    {
        id: 'accident',
        icon: '🚑',
        title: 'Accidente',
    },
    {
        id: 'breakdown',
        icon: '🚌',
        title: 'Transporte averiado',
    },
    {
        id: 'danger',
        icon: '⚠️',
        title: 'Zona peligrosa',
    },
    {
        id: 'other',
        icon: '📝',
        title: 'Otro',
    },
];

export default function IncidentModal({
    visible,
    onClose,
    onSelectIncident,
}) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
        >
            <View style={styles.incidentOverlay}>
                <View style={styles.incidentModal}>

                    <View style={styles.incidentHandle} />

                    <Text style={styles.incidentTitle}>
                        Reportar incidente
                    </Text>

                    <Text style={styles.incidentSubtitle}>
                        ¿Qué está ocurriendo durante el viaje?
                    </Text>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        {INCIDENTS.map((incident) => (

                            <TouchableOpacity
                                key={incident.id}
                                style={styles.incidentItem}
                                onPress={() => onSelectIncident(incident)}
                            >
                                <Text style={styles.incidentIcon}>
                                    {incident.icon}
                                </Text>

                                <Text style={styles.incidentItemText}>
                                    {incident.title}
                                </Text>

                            </TouchableOpacity>

                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.closeIncidentButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeIncidentText}>
                            Cancelar
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}