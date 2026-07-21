import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  DEMO_TRAFFIC_EVENTS,
} from "../mocks/demoTrafficEvents";

/**
 * Motor de eventos para la demostración.
 *
 * Responsabilidades:
 * - Normalizar la lista de eventos.
 * - Detectar eventos por porcentaje de avance.
 * - Permitir activar eventos manualmente.
 * - Mantener un historial.
 * - Enviar coordenadas compatibles con:
 *   - React Native Maps: latitude / longitude
 *   - Código anterior: lat / lng
 */
export const useActiveEventMonitor = ({
  route,
  isTripActive = false,
  tripProgress = 0,
  isBlocked = false,
  startBlockSimulation,
}) => {
  const [monitorEnabled, setMonitorEnabled] =
    useState(true);

  const [activeEvent, setActiveEvent] =
    useState(null);

  const [eventHistory, setEventHistory] =
    useState([]);

  const triggeredEventsRef = useRef(
    new Set()
  );

  /**
   * Convierte DEMO_TRAFFIC_EVENTS en un arreglo.
   *
   * Funciona si DEMO_TRAFFIC_EVENTS es:
   * - arreglo
   * - objeto
   * - null
   * - undefined
   */
  const trafficEvents = useMemo(() => {
    if (
      Array.isArray(DEMO_TRAFFIC_EVENTS)
    ) {
      return DEMO_TRAFFIC_EVENTS;
    }

    if (
      DEMO_TRAFFIC_EVENTS &&
      typeof DEMO_TRAFFIC_EVENTS ===
        "object"
    ) {
      return Object.values(
        DEMO_TRAFFIC_EVENTS
      );
    }

    return [];
  }, []);

  /**
   * Convierte las coordenadas del evento
   * a un formato compatible con ambos módulos.
   */
  const normalizeBlockPoint = useCallback(
    (event) => {
      const sourcePoint =
        event?.blockPoint ||
        event?.location ||
        null;

      if (!sourcePoint) {
        return null;
      }

      const latitude =
        sourcePoint.latitude ??
        sourcePoint.lat ??
        null;

      const longitude =
        sourcePoint.longitude ??
        sourcePoint.lng ??
        sourcePoint.lon ??
        null;

      const validLatitude =
        typeof latitude === "number" &&
        Number.isFinite(latitude);

      const validLongitude =
        typeof longitude === "number" &&
        Number.isFinite(longitude);

      if (
        !validLatitude ||
        !validLongitude
      ) {
        return null;
      }

      const name =
        sourcePoint.nombre ||
        sourcePoint.name ||
        event?.nombre ||
        event?.title ||
        "Evento de tránsito";

      return {
        // Formato React Native Maps
        latitude,
        longitude,

        // Formato usado por el módulo anterior
        lat: latitude,
        lng: longitude,

        // Compatibilidad adicional
        lon: longitude,

        nombre: name,
        name,

        eventId:
          event?.id || null,

        tipo:
          event?.tipo ||
          event?.type ||
          "INCIDENTE",

        severidad:
          event?.severidad ||
          event?.severity ||
          "NO_DEFINIDA",
      };
    },
    []
  );

  /**
   * Activa un evento y lo envía al módulo
   * encargado del bloqueo y recálculo.
   */
  const triggerTrafficEvent = useCallback(
    (event) => {
      if (!event) {
        return;
      }

      if (isBlocked) {
        console.log(
          "⏸️ Evento ignorado: ya existe un bloqueo activo"
        );
        return;
      }

      const blockPoint =
        normalizeBlockPoint(event);

      if (!blockPoint) {
        console.warn(
          `El evento "${
            event.id || "sin-id"
          }" no tiene coordenadas válidas`
        );
        return;
      }

      if (
        typeof startBlockSimulation !==
        "function"
      ) {
        console.warn(
          "startBlockSimulation no es una función"
        );
        return;
      }

      setActiveEvent(event);

      setEventHistory(
        (previousHistory) => [
          {
            id: `${
              event.id || "evento"
            }_${Date.now()}`,

            eventId:
              event.id || null,

            nombre:
              event.nombre ||
              event.title ||
              "Evento de tránsito",

            tipo:
              event.tipo ||
              event.type ||
              "INCIDENTE",

            fecha:
              new Date().toLocaleTimeString(),

            accion:
              "Evento detectado y enviado a recálculo",
          },
          ...previousHistory,
        ]
      );

      console.log(
        `🚧 Evento activado: ${blockPoint.nombre}`
      );

      console.log(
        "📍 Coordenadas normalizadas:",
        {
          latitude:
            blockPoint.latitude,
          longitude:
            blockPoint.longitude,
          lat: blockPoint.lat,
          lng: blockPoint.lng,
        }
      );

      startBlockSimulation(
        blockPoint
      );
    },
    [
      isBlocked,
      normalizeBlockPoint,
      startBlockSimulation,
    ]
  );

  /**
   * Activa manualmente un evento por ID.
   */
  const simulateEventById = useCallback(
    (eventId) => {
      const event =
        trafficEvents.find(
          (item) =>
            item?.id === eventId
        );

      if (!event) {
        console.warn(
          `No se encontró el evento con ID: ${eventId}`
        );
        return;
      }

      triggeredEventsRef.current.add(
        event.id
      );

      triggerTrafficEvent(event);
    },
    [
      trafficEvents,
      triggerTrafficEvent,
    ]
  );

  /**
   * Limpia el evento visual y permite
   * volver a ejecutar los eventos.
   */
  const clearActiveEvent =
    useCallback(() => {
      setActiveEvent(null);

      triggeredEventsRef.current.clear();
    }, []);

  /**
   * Limpia los eventos disparados
   * cuando cambia completamente la ruta.
   */
  useEffect(() => {
    triggeredEventsRef.current.clear();
    setActiveEvent(null);
  }, [route?.id]);

  /**
   * Detecta automáticamente un evento
   * según el progreso del viaje.
   */
  useEffect(() => {
    if (!monitorEnabled) {
      return;
    }

    if (!route) {
      return;
    }

    if (!isTripActive) {
      return;
    }

    if (isBlocked) {
      return;
    }

    if (
      !Array.isArray(
        trafficEvents
      ) ||
      trafficEvents.length === 0
    ) {
      return;
    }

    const safeProgress =
      Number(tripProgress) || 0;

    const eventToTrigger =
      trafficEvents.find(
        (event) => {
          if (!event?.id) {
            return false;
          }

          const alreadyTriggered =
            triggeredEventsRef.current.has(
              event.id
            );

          const triggerProgress =
            Number(
              event.triggerProgress
            ) || 0;

          const reachedProgress =
            safeProgress >=
            triggerProgress;

          return (
            !alreadyTriggered &&
            reachedProgress
          );
        }
      );

    if (!eventToTrigger) {
      return;
    }

    triggeredEventsRef.current.add(
      eventToTrigger.id
    );

    triggerTrafficEvent(
      eventToTrigger
    );
  }, [
    monitorEnabled,
    route,
    isTripActive,
    tripProgress,
    isBlocked,
    trafficEvents,
    triggerTrafficEvent,
  ]);

  return {
    monitorEnabled,
    setMonitorEnabled,

    activeEvent,
    eventHistory,

    trafficEvents,

    simulateEventById,
    clearActiveEvent,
  };
};