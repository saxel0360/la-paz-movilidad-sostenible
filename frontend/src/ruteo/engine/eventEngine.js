/**
 * Aplica eventos de tránsito sobre las aristas del grafo.
 *
 * CLOSE:
 * Bloquea completamente una vía.
 *
 * PENALIZE:
 * Incrementa el costo de una vía por tráfico,
 * obras u otros incidentes.
 *
 * @param {Array} originalEdges
 * @param {Array} activeEvents
 * @returns {Array}
 */
export const applyEventsToGraph = (
  originalEdges = [],
  activeEvents = []
) => {
  return originalEdges.map((edge) => {
    let updatedEdge = {
      ...edge,
      status: "OPEN",
      trafficMultiplier: 1,
      blockedBy: null,
      affectedBy: null,
    };

    activeEvents.forEach((event) => {
      const affectedEdgeIds =
        event?.effect?.affectedEdgeIds || [];

      const affectsCurrentEdge =
        affectedEdgeIds.includes(edge.id);

      if (!affectsCurrentEdge) {
        return;
      }

      if (event.effect.type === "CLOSE") {
        updatedEdge = {
          ...updatedEdge,
          status: "BLOCKED",
          blockedBy: event.id,
          affectedBy: event.id,
        };

        return;
      }

      if (event.effect.type === "PENALIZE") {
        /*
         * Si la vía ya quedó bloqueada por otro evento,
         * no debemos volverla congestionada.
         */
        if (updatedEdge.status === "BLOCKED") {
          return;
        }

        const eventMultiplier =
          Number(event.effect.multiplier) || 1.5;

        updatedEdge = {
          ...updatedEdge,
          status: "CONGESTED",

          /*
           * Permite acumular más de una penalización.
           */
          trafficMultiplier:
            updatedEdge.trafficMultiplier *
            eventMultiplier,

          affectedBy: event.id,
        };
      }
    });

    return updatedEdge;
  });
};

/**
 * Comprueba si un evento afecta una ruta concreta.
 *
 * @param {Object} event
 * @param {Array<string>} routeEdgeIds
 * @returns {boolean}
 */
export const doesEventAffectRoute = (
  event,
  routeEdgeIds = []
) => {
  if (!event || routeEdgeIds.length === 0) {
    return false;
  }

  const affectedEdgeIds =
    event.effect?.affectedEdgeIds || [];

  return affectedEdgeIds.some((edgeId) =>
    routeEdgeIds.includes(edgeId)
  );
};

/**
 * Comprueba si alguno de los eventos activos
 * afecta la ruta actual.
 *
 * @param {Array} activeEvents
 * @param {Array<string>} routeEdgeIds
 * @returns {Array}
 */
export const getEventsAffectingRoute = (
  activeEvents = [],
  routeEdgeIds = []
) => {
  return activeEvents.filter((event) =>
    doesEventAffectRoute(
      event,
      routeEdgeIds
    )
  );
};

/**
 * Devuelve un resumen de las vías modificadas.
 *
 * @param {Array} edges
 * @returns {Object}
 */
export const getGraphEventSummary = (
  edges = []
) => {
  const blockedEdges = edges.filter(
    (edge) => edge.status === "BLOCKED"
  );

  const congestedEdges = edges.filter(
    (edge) => edge.status === "CONGESTED"
  );

  return {
    blockedEdges,
    congestedEdges,
    blockedCount: blockedEdges.length,
    congestedCount: congestedEdges.length,
    affectedCount:
      blockedEdges.length +
      congestedEdges.length,
  };
};