import {
  LA_PAZ_DEMO_CONFIG,
  LA_PAZ_DEMO_NODES,
  getFreshDemoEdges,
} from "../graphs/laPazDemoGraph";

import {
  calculateInitialRoute,
  recalculateSmartRoute,
  compareRoutes,
} from "./smartRecalculator";

import {
  graphPathToMapRoute,
} from "./graphPathToMapRoute";

import {
  getEventsForScenario,
} from "../mocks/demoTrafficEvents";

/**
 * Preferencias predeterminadas del motor.
 */
export const DEFAULT_ROUTE_PREFERENCES = {
  fastest: true,
  lowCost: false,
  lessWalking: false,
  safer: false,
};

/**
 * Calcula la ruta inicial sin incidentes.
 *
 * @param {Object} preferences
 * @returns {Object}
 */
export const buildInitialDemoRoute = (
  preferences = DEFAULT_ROUTE_PREFERENCES
) => {
  const originalEdges = getFreshDemoEdges();

  const result = calculateInitialRoute({
    startNodeId:
      LA_PAZ_DEMO_CONFIG.startNodeId,

    endNodeId:
      LA_PAZ_DEMO_CONFIG.endNodeId,

    nodes: LA_PAZ_DEMO_NODES,

    originalEdges,

    preferences,
  });

  if (!result.success || !result.path) {
    return {
      ...result,
      mapRoute: null,
      originalEdges,
      activeEvents: [],
    };
  }

  const mapRoute = graphPathToMapRoute({
    path: result.path,
    nodes: LA_PAZ_DEMO_NODES,

    originName:
      LA_PAZ_DEMO_CONFIG.originName,

    destinationName:
      LA_PAZ_DEMO_CONFIG.destinationName,

    isRecalculated: false,
  });

  return {
    ...result,

    mapRoute,
    originalEdges,
    activeEvents: [],
  };
};

/**
 * Ejecuta un escenario demostrativo.
 *
 * @param {Object} params
 * @param {string} params.scenarioId
 * @param {string} params.currentNodeId
 * @param {Object} params.previousPath
 * @param {Object} params.preferences
 * @returns {Object}
 */
export const runDemoScenario = ({
  scenarioId,
  currentNodeId =
    LA_PAZ_DEMO_CONFIG.startNodeId,

  previousPath = null,

  preferences =
    DEFAULT_ROUTE_PREFERENCES,
}) => {
  const originalEdges = getFreshDemoEdges();

  const activeEvents =
    getEventsForScenario(scenarioId);

  const result = recalculateSmartRoute({
    currentNodeId,

    destinationNodeId:
      LA_PAZ_DEMO_CONFIG.endNodeId,

    nodes: LA_PAZ_DEMO_NODES,

    originalEdges,

    activeEvents,

    preferences,
  });

  if (!result.success || !result.path) {
    return {
      ...result,

      scenarioId,
      activeEvents,
      originalEdges,

      mapRoute: null,

      comparison: compareRoutes(
        previousPath,
        null
      ),
    };
  }

  const currentNode =
    LA_PAZ_DEMO_NODES[currentNodeId];

  const mapRoute = graphPathToMapRoute({
    path: result.path,

    nodes: LA_PAZ_DEMO_NODES,

    originName:
      currentNode?.name ||
      LA_PAZ_DEMO_CONFIG.originName,

    destinationName:
      LA_PAZ_DEMO_CONFIG.destinationName,

    isRecalculated:
      activeEvents.length > 0,
  });

  const comparison = compareRoutes(
    previousPath,
    result.path
  );

  return {
    ...result,

    scenarioId,
    activeEvents,
    originalEdges,

    mapRoute,
    comparison,
  };
};

/**
 * Devuelve el nodo más cercano a una coordenada.
 *
 * En la demostración se utiliza para recalcular
 * desde la posición aproximada del usuario.
 *
 * @param {{latitude:number, longitude:number}} position
 * @returns {Object|null}
 */
export const findNearestDemoNode = (
  position
) => {
  if (
    !position ||
    typeof position.latitude !== "number" ||
    typeof position.longitude !== "number"
  ) {
    return null;
  }

  const nodes = Object.values(
    LA_PAZ_DEMO_NODES
  );

  let nearestNode = null;
  let nearestDistance = Infinity;

  nodes.forEach((node) => {
    const latitudeDifference =
      node.latitude - position.latitude;

    const longitudeDifference =
      node.longitude - position.longitude;

    /*
     * Para una demostración pequeña es suficiente
     * utilizar distancia euclidiana entre coordenadas.
     */
    const distance =
      Math.sqrt(
        latitudeDifference ** 2 +
        longitudeDifference ** 2
      );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestNode = node;
    }
  });

  return nearestNode;
};

/**
 * Devuelve los puntos principales de una ruta.
 *
 * @param {Object} mapRoute
 * @returns {Array}
 */
export const getRouteCoordinates = (
  mapRoute
) => {
  if (!mapRoute) {
    return [];
  }

  if (
    Array.isArray(mapRoute.coordenadas)
  ) {
    return mapRoute.coordenadas;
  }

  return [];
};

/**
 * Devuelve los IDs de las aristas
 * utilizadas por una ruta.
 *
 * @param {Object} path
 * @returns {Array<string>}
 */
export const getPathEdgeIds = (path) => {
  if (!Array.isArray(path?.edges)) {
    return [];
  }

  return path.edges.map(
    (edge) => edge.id
  );
};