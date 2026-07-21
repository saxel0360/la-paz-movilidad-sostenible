import { findRouteAStar } from "../algorithms/aStar";
import {
  applyEventsToGraph,
  getGraphEventSummary,
} from "./eventEngine";

/**
 * Calcula una ruta usando el grafo original.
 *
 * Se utiliza para obtener la ruta inicial,
 * antes de aplicar bloqueos o congestión.
 *
 * @param {Object} params
 * @returns {Object}
 */
export const calculateInitialRoute = ({
  startNodeId,
  endNodeId,
  nodes,
  originalEdges,
  preferences = {},
}) => {
  const startedAt = Date.now();

  const path = findRouteAStar({
    startNodeId,
    endNodeId,
    nodes,
    edges: originalEdges,
    preferences,
  });

  const calculationTimeMs =
    Date.now() - startedAt;

  if (!path) {
    return {
      success: false,
      reason: "NO_ROUTE_AVAILABLE",
      message:
        "No se encontró una ruta entre el origen y el destino.",
      path: null,
      updatedEdges: originalEdges,
      metrics: {
        algorithm: "A*",
        calculationTimeMs,
        exploredNodesCount: 0,
      },
    };
  }

  return {
    success: true,
    reason: "INITIAL_ROUTE_FOUND",
    message:
      "La ruta inicial fue calculada correctamente.",
    path,
    updatedEdges: originalEdges,
    metrics: {
      algorithm: "A*",
      calculationTimeMs,
      exploredNodesCount:
        path.exploredNodesCount || 0,
      totalCost: path.totalCost || 0,
    },
  };
};

/**
 * Recalcula una ruta aplicando primero
 * los eventos activos sobre el grafo.
 *
 * @param {Object} params
 * @param {string} params.currentNodeId
 * @param {string} params.destinationNodeId
 * @param {Object} params.nodes
 * @param {Array} params.originalEdges
 * @param {Array} params.activeEvents
 * @param {Object} params.preferences
 * @returns {Object}
 */
export const recalculateSmartRoute = ({
  currentNodeId,
  destinationNodeId,
  nodes,
  originalEdges,
  activeEvents = [],
  preferences = {},
}) => {
  if (!currentNodeId) {
    return {
      success: false,
      reason: "CURRENT_NODE_REQUIRED",
      message:
        "No se recibió la ubicación actual del usuario.",
      path: null,
    };
  }

  if (!destinationNodeId) {
    return {
      success: false,
      reason: "DESTINATION_REQUIRED",
      message:
        "No se recibió el destino del viaje.",
      path: null,
    };
  }

  const updatedEdges = applyEventsToGraph(
    originalEdges,
    activeEvents
  );

  const eventSummary =
    getGraphEventSummary(updatedEdges);

  const startedAt = Date.now();

  const path = findRouteAStar({
    startNodeId: currentNodeId,
    endNodeId: destinationNodeId,
    nodes,
    edges: updatedEdges,
    preferences,
  });

  const calculationTimeMs =
    Date.now() - startedAt;

  if (!path) {
    return {
      success: false,
      reason: "NO_ROUTE_AVAILABLE",

      message:
        "Todos los caminos conocidos hacia el destino están bloqueados.",

      path: null,
      updatedEdges,
      eventSummary,

      metrics: {
        algorithm: "A*",
        calculationTimeMs,
        exploredNodesCount: 0,
        totalCost: 0,
      },
    };
  }

  return {
    success: true,
    reason: "ALTERNATIVE_ROUTE_FOUND",

    message:
      activeEvents.length > 0
        ? "Se encontró una ruta alternativa."
        : "La ruta fue calculada correctamente.",

    path,
    updatedEdges,
    eventSummary,

    metrics: {
      algorithm: "A*",
      calculationTimeMs,
      exploredNodesCount:
        path.exploredNodesCount || 0,
      totalCost: path.totalCost || 0,
    },
  };
};

/**
 * Compara la ruta anterior con la nueva.
 *
 * @param {Object|null} previousPath
 * @param {Object|null} newPath
 * @returns {Object}
 */
export const compareRoutes = (
  previousPath,
  newPath
) => {
  if (!previousPath || !newPath) {
    return {
      changed: false,
      previousCost: 0,
      newCost: 0,
      costDifference: 0,
      previousEdgeIds: [],
      newEdgeIds: [],
    };
  }

  const previousEdgeIds =
    previousPath.edges?.map(
      (edge) => edge.id
    ) || [];

  const newEdgeIds =
    newPath.edges?.map(
      (edge) => edge.id
    ) || [];

  const changed =
    previousEdgeIds.join("|") !==
    newEdgeIds.join("|");

  const previousCost =
    Number(previousPath.totalCost) || 0;

  const newCost =
    Number(newPath.totalCost) || 0;

  return {
    changed,
    previousCost,
    newCost,

    costDifference:
      newCost - previousCost,

    previousEdgeIds,
    newEdgeIds,
  };
};