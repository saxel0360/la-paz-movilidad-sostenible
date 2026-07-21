// export const DEMO_TRAFFIC_EVENTS = [
//     {
//         id: 'bloqueo_prado',
//         tipo: 'BLOQUEO',
//         nombre: 'Bloqueo en El Prado',
//         descripcion: 'Manifestación ciudadana bloquea el paso por Av. 16 de Julio y Av. Mariscal Santa Cruz.',
//         severidad: 'ALTA',
//         zona: 'Centro',
//         icono: '🚧',
//         color: '#EF4444',
//         triggerProgress: 25,
//         afecta: ['minibus', 'pumakatari'],
//         blockPoint: {
//             lat: -16.4982,
//             lng: -68.1357,
//             nombre: 'Av. Mariscal Santa Cruz - El Prado',
//             descripcion: 'Bloqueo por manifestación. Se recomienda evitar el centro.',
//             afecta: ['minibus', 'pumakatari'],
//         },
//     },
//     {
//         id: 'marcha_san_francisco',
//         tipo: 'MARCHA',
//         nombre: 'Marcha en San Francisco',
//         descripcion: 'Marcha se desplaza por Plaza San Francisco afectando rutas hacia el centro.',
//         severidad: 'MEDIA',
//         zona: 'San Francisco',
//         icono: '🚶‍♂️',
//         color: '#F59E0B',
//         triggerProgress: 45,
//         afecta: ['minibus'],
//         blockPoint: {
//             lat: -16.4969,
//             lng: -68.1378,
//             nombre: 'Plaza San Francisco',
//             descripcion: 'Marcha en Plaza San Francisco. Posibles desvíos y demora.',
//             afecta: ['minibus'],
//         },
//     },
//     {
//         id: 'trancadera_ballivian',
//         tipo: 'TRANCADERA',
//         nombre: 'Trancadera en Av. Ballivián',
//         descripcion: 'Alta congestión vehicular en zona sur por tráfico intenso.',
//         severidad: 'MEDIA',
//         zona: 'Zona Sur',
//         icono: '🚗',
//         color: '#F97316',
//         triggerProgress: 60,
//         afecta: ['minibus', 'pumakatari'],
//         blockPoint: {
//             lat: -16.5140,
//             lng: -68.1220,
//             nombre: 'Av. Ballivián',
//             descripcion: 'Trancadera en Av. Ballivián. Se busca ruta alternativa.',
//             afecta: ['minibus', 'pumakatari'],
//         },
//     },
//     {
//         id: 'obra_puente_trillizos',
//         tipo: 'OBRA',
//         nombre: 'Obra en Puente Trillizos',
//         descripcion: 'Trabajo municipal reduce carriles de circulación.',
//         severidad: 'MEDIA',
//         zona: 'Puente Trillizos',
//         icono: '🏗️',
//         color: '#6B7280',
//         triggerProgress: 35,
//         afecta: ['minibus', 'pumakatari'],
//         blockPoint: {
//             lat: -16.5050,
//             lng: -68.1450,
//             nombre: 'Puente Trillizos',
//             descripcion: 'Obra vial reduce el paso. Recalculando alternativa.',
//             afecta: ['minibus', 'pumakatari'],
//         },
//     },
// ];
/**
 * Eventos demostrativos para el motor de navegación.
 *
 * Cada evento afecta una o varias aristas del grafo.
 *
 * Tipos de efecto:
 * - CLOSE: bloquea totalmente una vía.
 * - PENALIZE: aumenta el costo y tiempo de una vía.
 */
export const DEMO_TRAFFIC_EVENTS = {
  bloqueoPradoObrajes: {
    id: "bloqueo_prado_obrajes",

    type: "BLOCK",
    title: "Bloqueo en la ruta principal",

    description:
      "Una manifestación bloqueó completamente el tramo entre El Prado y Obrajes.",

    severity: "HIGH",

    icon: "🚧",
    color: "#DC2626",

    triggerProgress: 25,

    location: {
      name: "Tramo El Prado - Obrajes",
      latitude: -16.508,
      longitude: -68.128,
    },

    effect: {
      type: "CLOSE",

      affectedEdgeIds: [
        "prado-obrajes",
      ],
    },
  },

  congestionObrajesCalacoto: {
    id: "congestion_obrajes_calacoto",

    type: "TRAFFIC",
    title: "Congestión vehicular",

    description:
      "Existe tráfico intenso entre Obrajes y Calacoto.",

    severity: "MEDIUM",

    icon: "🚗",
    color: "#F97316",

    triggerProgress: 55,

    location: {
      name: "Tramo Obrajes - Calacoto",
      latitude: -16.53,
      longitude: -68.103,
    },

    effect: {
      type: "PENALIZE",

      multiplier: 2.2,

      affectedEdgeIds: [
        "obrajes-calacoto",
      ],
    },
  },

  obraPuenteTrillizos: {
    id: "obra_puente_trillizos",

    type: "ROAD_WORK",
    title: "Obras en Puente Trillizos",

    description:
      "La circulación está reducida por trabajos de mantenimiento.",

    severity: "MEDIUM",

    icon: "🏗️",
    color: "#6B7280",

    triggerProgress: 35,

    location: {
      name: "Puente Trillizos",
      latitude: -16.505,
      longitude: -68.145,
    },

    effect: {
      type: "PENALIZE",

      multiplier: 1.7,

      affectedEdgeIds: [
        "prado-trillizos",
        "trillizos-obrajes",
      ],
    },
  },

  bloqueoPradoEstadio: {
    id: "bloqueo_prado_estadio",

    type: "BLOCK",
    title: "Bloqueo hacia Miraflores",

    description:
      "El acceso desde El Prado hacia el Estadio está cerrado.",

    severity: "HIGH",

    icon: "⛔",
    color: "#B91C1C",

    triggerProgress: 30,

    location: {
      name: "El Prado - Estadio",
      latitude: -16.499,
      longitude: -68.129,
    },

    effect: {
      type: "CLOSE",

      affectedEdgeIds: [
        "prado-estadio",
      ],
    },
  },

  bloqueoPradoTrillizos: {
    id: "bloqueo_prado_trillizos",

    type: "BLOCK",
    title: "Bloqueo hacia Puente Trillizos",

    description:
      "El acceso hacia Puente Trillizos está completamente bloqueado.",

    severity: "HIGH",

    icon: "⛔",
    color: "#B91C1C",

    triggerProgress: 30,

    location: {
      name: "El Prado - Puente Trillizos",
      latitude: -16.503,
      longitude: -68.141,
    },

    effect: {
      type: "CLOSE",

      affectedEdgeIds: [
        "prado-trillizos",
      ],
    },
  },
};

/**
 * Escenarios listos para usar en la pantalla demostrativa.
 */
export const DEMO_SCENARIOS = [
  {
    id: "normal",

    name: "Viaje normal",

    description:
      "La ruta se calcula sin incidentes.",

    icon: "✅",

    eventIds: [],
  },

  {
    id: "total_block",

    name: "Bloqueo total",

    description:
      "Se bloquea el tramo principal El Prado - Obrajes.",

    icon: "🚧",

    eventIds: [
      "bloqueo_prado_obrajes",
    ],
  },

  {
    id: "traffic",

    name: "Trancadera",

    description:
      "Se incrementa el tiempo entre Obrajes y Calacoto.",

    icon: "🚗",

    eventIds: [
      "congestion_obrajes_calacoto",
    ],
  },

  {
    id: "multiple_events",

    name: "Dos incidentes",

    description:
      "Existe un bloqueo y una congestión durante el viaje.",

    icon: "⚠️",

    eventIds: [
      "bloqueo_prado_obrajes",
      "congestion_obrajes_calacoto",
    ],
  },

  {
    id: "no_route",

    name: "Sin ruta disponible",

    description:
      "Todas las salidas desde El Prado hacia Obrajes quedan bloqueadas.",

    icon: "⛔",

    eventIds: [
      "bloqueo_prado_obrajes",
      "bloqueo_prado_estadio",
      "bloqueo_prado_trillizos",
    ],
  },
];

/**
 * Busca un evento por su identificador.
 *
 * @param {string} eventId
 * @returns {Object|null}
 */
export const getTrafficEventById = (eventId) => {
  const events = Object.values(
    DEMO_TRAFFIC_EVENTS
  );

  return (
    events.find(
      (event) => event.id === eventId
    ) || null
  );
};

/**
 * Devuelve todos los eventos de un escenario.
 *
 * @param {string} scenarioId
 * @returns {Array}
 */
export const getEventsForScenario = (
  scenarioId
) => {
  const scenario = DEMO_SCENARIOS.find(
    (item) => item.id === scenarioId
  );

  if (!scenario) {
    return [];
  }

  return scenario.eventIds
    .map(getTrafficEventById)
    .filter(Boolean);
};