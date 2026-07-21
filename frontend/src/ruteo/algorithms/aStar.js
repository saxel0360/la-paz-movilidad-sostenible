import { haversineKm } from "./haversine";
import { calculateEdgeCost } from "./routeCost";

/**
 * Obtiene los nodos vecinos de un nodo.
 *
 * @param {string} nodeId
 * @param {Array} edges
 * @returns {Array}
 */
const getNeighbors = (nodeId, edges) => {
  const neighbors = [];

  edges.forEach((edge) => {
    if (edge.from === nodeId) {
      neighbors.push({
        nodeId: edge.to,
        edge,
      });
    }

    if (
      edge.bidirectional === true &&
      edge.to === nodeId
    ) {
      neighbors.push({
        nodeId: edge.from,
        edge,
      });
    }
  });

  return neighbors;
};

/**
 * Reconstruye la ruta final desde el destino
 * hasta el origen.
 *
 * @param {Object} cameFrom
 * @param {Object} edgeFrom
 * @param {string} currentNodeId
 * @returns {{ nodes: Array, edges: Array }}
 */
const reconstructPath = (
  cameFrom,
  edgeFrom,
  currentNodeId
) => {
  const nodes = [currentNodeId];
  const edges = [];

  let current = currentNodeId;

  while (cameFrom[current]) {
    edges.unshift(edgeFrom[current]);
    current = cameFrom[current];
    nodes.unshift(current);
  }

  return {
    nodes,
    edges,
  };
};

/**
 * Busca la mejor ruta utilizando el algoritmo A*.
 *
 * @param {Object} params
 * @param {string} params.startNodeId
 * @param {string} params.endNodeId
 * @param {Object} params.nodes
 * @param {Array} params.edges
 * @param {Object} params.preferences
 * @returns {Object|null}
 */
export const findRouteAStar = ({
  startNodeId,
  endNodeId,
  nodes,
  edges,
  preferences = {},
}) => {
  if (!nodes?.[startNodeId]) {
    throw new Error(
      `El nodo de origen "${startNodeId}" no existe`
    );
  }

  if (!nodes?.[endNodeId]) {
    throw new Error(
      `El nodo de destino "${endNodeId}" no existe`
    );
  }

  const openSet = new Set([startNodeId]);
  const closedSet = new Set();

  const cameFrom = {};
  const edgeFrom = {};

  const gScore = {};
  const fScore = {};

  const visitedNodes = [];

  Object.keys(nodes).forEach((nodeId) => {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
  });

  gScore[startNodeId] = 0;

  fScore[startNodeId] = haversineKm(
    nodes[startNodeId],
    nodes[endNodeId]
  );

  while (openSet.size > 0) {
    let currentNodeId = null;
    let lowestScore = Infinity;

    openSet.forEach((nodeId) => {
      if (fScore[nodeId] < lowestScore) {
        lowestScore = fScore[nodeId];
        currentNodeId = nodeId;
      }
    });

    if (!currentNodeId) {
      break;
    }

    visitedNodes.push(currentNodeId);

    if (currentNodeId === endNodeId) {
      const path = reconstructPath(
        cameFrom,
        edgeFrom,
        currentNodeId
      );

      return {
        ...path,
        totalCost: gScore[endNodeId],
        visitedNodes,
        exploredNodesCount: visitedNodes.length,
      };
    }

    openSet.delete(currentNodeId);
    closedSet.add(currentNodeId);

    const neighbors = getNeighbors(
      currentNodeId,
      edges
    );

    neighbors.forEach((neighbor) => {
      if (closedSet.has(neighbor.nodeId)) {
        return;
      }

      const edgeCost = calculateEdgeCost(
        neighbor.edge,
        preferences
      );

      if (!Number.isFinite(edgeCost)) {
        return;
      }

      const tentativeScore =
        gScore[currentNodeId] + edgeCost;

      if (
        tentativeScore <
        gScore[neighbor.nodeId]
      ) {
        cameFrom[neighbor.nodeId] =
          currentNodeId;

        edgeFrom[neighbor.nodeId] =
          neighbor.edge;

        gScore[neighbor.nodeId] =
          tentativeScore;

        const heuristic = haversineKm(
          nodes[neighbor.nodeId],
          nodes[endNodeId]
        );

        fScore[neighbor.nodeId] =
          tentativeScore + heuristic;

        openSet.add(neighbor.nodeId);
      }
    });
  }

  return null;
};