/**
 * Nodos demostrativos de La Paz.
 *
 * Cada nodo representa una parada,
 * plaza o punto importante del recorrido.
 */
export const LA_PAZ_DEMO_NODES = {
  plaza_murillo: {
    id: "plaza_murillo",
    name: "Plaza Murillo",
    latitude: -16.4958,
    longitude: -68.1333,
  },

  san_francisco: {
    id: "san_francisco",
    name: "Plaza San Francisco",
    latitude: -16.4969,
    longitude: -68.1378,
  },

  prado: {
    id: "prado",
    name: "El Prado",
    latitude: -16.4992,
    longitude: -68.1357,
  },

  estadio: {
    id: "estadio",
    name: "Estadio Hernando Siles",
    latitude: -16.4994,
    longitude: -68.1228,
  },

  puente_trillizos: {
    id: "puente_trillizos",
    name: "Puente Trillizos",
    latitude: -16.505,
    longitude: -68.145,
  },

  obrajes: {
    id: "obrajes",
    name: "Obrajes",
    latitude: -16.52,
    longitude: -68.12,
  },

  calacoto: {
    id: "calacoto",
    name: "Calacoto",
    latitude: -16.54,
    longitude: -68.086,
  },

  calle_21: {
    id: "calle_21",
    name: "Calle 21 de Calacoto",
    latitude: -16.5415,
    longitude: -68.0845,
  },
};

/**
 * Aristas demostrativas.
 *
 * Cada arista representa una conexión
 * posible entre dos nodos del grafo.
 */
export const LA_PAZ_DEMO_EDGES = [
  {
    id: "murillo-sanfrancisco",
    from: "plaza_murillo",
    to: "san_francisco",
    bidirectional: true,

    name: "Plaza Murillo - San Francisco",
    transport: "WALK",

    distanceKm: 0.7,
    durationMinutes: 8,
    costBs: 0,
    riskScore: 1,

    status: "OPEN",
    trafficMultiplier: 1,
  },

  {
    id: "sanfrancisco-prado",
    from: "san_francisco",
    to: "prado",
    bidirectional: true,

    name: "San Francisco - El Prado",
    transport: "MINIBUS",

    distanceKm: 0.8,
    durationMinutes: 6,
    costBs: 2.5,
    riskScore: 1,

    status: "OPEN",
    trafficMultiplier: 1,
  },

  /**
   * Ruta principal.
   * Este tramo será bloqueado en una
   * de las simulaciones.
   */
  {
    id: "prado-obrajes",
    from: "prado",
    to: "obrajes",
    bidirectional: true,

    name: "El Prado - Obrajes",
    transport: "MINIBUS",

    distanceKm: 4.2,
    durationMinutes: 18,
    costBs: 2.5,
    riskScore: 1,

    status: "OPEN",
    trafficMultiplier: 1,
  },

  /**
   * Primera alternativa:
   * Prado -> Estadio -> Obrajes.
   */
  {
    id: "prado-estadio",
    from: "prado",
    to: "estadio",
    bidirectional: true,

    name: "El Prado - Estadio",
    transport: "MINIBUS",

    distanceKm: 2.1,
    durationMinutes: 10,
    costBs: 2.5,
    riskScore: 1,

    status: "OPEN",
    trafficMultiplier: 1,
  },

  {
    id: "estadio-obrajes",
    from: "estadio",
    to: "obrajes",
    bidirectional: true,

    name: "Estadio - Obrajes",
    transport: "MINIBUS",

    distanceKm: 3.5,
    durationMinutes: 16,
    costBs: 2.5,
    riskScore: 1,

    status: "OPEN",
    trafficMultiplier: 1,
  },

  /**
   * Segunda alternativa:
   * Prado -> Puente Trillizos -> Obrajes.
   */
  {
    id: "prado-trillizos",
    from: "prado",
    to: "puente_trillizos",
    bidirectional: true,

    name: "El Prado - Puente Trillizos",
    transport: "MINIBUS",

    distanceKm: 3,
    durationMinutes: 14,
    costBs: 2.5,
    riskScore: 2,

    status: "OPEN",
    trafficMultiplier: 1,
  },

  {
    id: "trillizos-obrajes",
    from: "puente_trillizos",
    to: "obrajes",
    bidirectional: true,

    name: "Puente Trillizos - Obrajes",
    transport: "MINIBUS",

    distanceKm: 2.6,
    durationMinutes: 12,
    costBs: 2.5,
    riskScore: 2,

    status: "OPEN",
    trafficMultiplier: 1,
  },

  {
    id: "obrajes-calacoto",
    from: "obrajes",
    to: "calacoto",
    bidirectional: true,

    name: "Obrajes - Calacoto",
    transport: "PUMAKATARI",

    distanceKm: 3,
    durationMinutes: 13,
    costBs: 2.5,
    riskScore: 1,

    status: "OPEN",
    trafficMultiplier: 1,
  },

  {
    id: "calacoto-calle21",
    from: "calacoto",
    to: "calle_21",
    bidirectional: true,

    name: "Calacoto - Calle 21",
    transport: "WALK",

    distanceKm: 0.5,
    durationMinutes: 6,
    costBs: 0,
    riskScore: 1,

    status: "OPEN",
    trafficMultiplier: 1,
  },
];

/**
 * Configuración general de la demostración.
 */
export const LA_PAZ_DEMO_CONFIG = {
  startNodeId: "plaza_murillo",
  endNodeId: "calle_21",

  originName: "Plaza Murillo",
  destinationName: "Calle 21 de Calacoto",
};

/**
 * Devuelve una copia limpia de las aristas.
 *
 * Es importante copiar las aristas para evitar
 * modificar permanentemente el grafo original.
 */
export const getFreshDemoEdges = () => {
  return LA_PAZ_DEMO_EDGES.map((edge) => ({
    ...edge,
    status: "OPEN",
    trafficMultiplier: 1,
    blockedBy: null,
    affectedBy: null,
  }));
};