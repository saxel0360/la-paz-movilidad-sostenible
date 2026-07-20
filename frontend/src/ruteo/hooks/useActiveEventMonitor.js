import { useEffect, useRef, useState } from 'react';
import { DEMO_TRAFFIC_EVENTS } from '../mocks/demoTrafficEvents';

/**
 * Motor de eventos para la demo.
 * No calcula rutas directamente.
 * Solo detecta eventos y llama al módulo existente de bloqueos.
 */
export const useActiveEventMonitor = ({
    route,
    isTripActive,
    tripProgress,
    isBlocked,
    startBlockSimulation,
}) => {
    const [monitorEnabled, setMonitorEnabled] = useState(true);
    const [activeEvent, setActiveEvent] = useState(null);
    const [eventHistory, setEventHistory] = useState([]);
    const triggeredEventsRef = useRef(new Set());

    const triggerTrafficEvent = (event) => {
        if (!event || isBlocked) return;

        setActiveEvent(event);

        setEventHistory((prev) => [
            {
                id: `${event.id}_${Date.now()}`,
                eventId: event.id,
                nombre: event.nombre,
                tipo: event.tipo,
                fecha: new Date().toLocaleTimeString(),
                accion: 'Evento detectado y enviado a recálculo',
            },
            ...prev,
        ]);

        startBlockSimulation(event.blockPoint);
    };

    const simulateEventById = (eventId) => {
        const event = DEMO_TRAFFIC_EVENTS.find((item) => item.id === eventId);
        if (!event) return;

        triggeredEventsRef.current.add(event.id);
        triggerTrafficEvent(event);
    };

    const clearActiveEvent = () => {
        setActiveEvent(null);
        triggeredEventsRef.current.clear();
    };

    useEffect(() => {
        if (!monitorEnabled) return;
        if (!route) return;
        if (!isTripActive) return;
        if (isBlocked) return;

        const eventToTrigger = DEMO_TRAFFIC_EVENTS.find((event) => {
            const alreadyTriggered = triggeredEventsRef.current.has(event.id);
            const reachedProgress = tripProgress >= event.triggerProgress;

            return !alreadyTriggered && reachedProgress;
        });

        if (eventToTrigger) {
            triggeredEventsRef.current.add(eventToTrigger.id);
            triggerTrafficEvent(eventToTrigger);
        }
    }, [monitorEnabled, route, isTripActive, tripProgress, isBlocked]);

    return {
        monitorEnabled,
        setMonitorEnabled,
        activeEvent,
        eventHistory,
        trafficEvents: DEMO_TRAFFIC_EVENTS,
        simulateEventById,
        clearActiveEvent,
    };
};