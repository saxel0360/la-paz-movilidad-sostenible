/**
 * Devuelve un color según el tipo de transporte.
 *
 * @param {string} transport
 * @returns {string}
 */
const getTransportColor = (transport) => {
  const colors = {
    WALK: "#6B7280",
    MINIBUS: "#2563EB",
    PUMAKATARI: "#16A34A",
    TELEFERICO: "#DC2626",
  };

  return colors[transport] || "#111827";
};

/**
 * Devuelve una etiqueta legible para el transporte.
 *
 * @param {string} transport
 * @returns {string}
 */
const getTransportLabel = (transport) => {
  const labels = {
    WALK: "Caminata",
    MINIBUS: "Minibús",
    PUMAKATARI: "PumaKatari",
    TELEFERICO: "Teleférico",
  };

  return labels[transport] || "Transporte";
};

/**
 * Cuenta los cambios de transporte.
 *
 * @param {Array} edges
 * @returns {number}
 */
const countTransfers = (edges = []) => {
  if (edges.length <= 1) {
    return 0;
  }

  let transfers = 0;

  for (
    let index = 1;
    index < edges.length;
    index += 1
  ) {
    const previousTransport =
      edges[index - 1]?.transport;

    const currentTransport =
      edges[index]?.transport;

    if (
      previousTransport &&
      currentTransport &&
      previousTransport !== currentTransport
    ) {
      transfers += 1;
    }
  }

  return transfers;
};

/**
 * Convierte una ruta obtenida por A*
 * al formato que puede utilizar el mapa.
 *
 * @param {Object} params
 * @param {Object} params.path
 * @param {Object} params.nodes
 * @param {string} params.originName
 * @param {string} params.destinationName
 * @param {boolean} params.isRecalculated
 * @returns {Object|null}
 */
export const graphPathToMapRoute = ({
  path,
  nodes,
  originName = "Origen",
  destinationName = "Destino",
  isRecalculated = false,
}) => {
  if (
    !path ||
    !Array.isArray(path.nodes) ||
    !Array.isArray(path.edges)
  ) {
    return null;
  }

  const tramos = path.edges.map(
    (edge, index) => {
      const fromNodeId = path.nodes[index];
      const toNodeId = path.nodes[index + 1];

      const fromNode = nodes[fromNodeId];
      const toNode = nodes[toNodeId];

      if (!fromNode || !toNode) {
        return null;
      }

      const transportLabel =
        getTransportLabel(edge.transport);

      return {
        id: edge.id,

        tipo: edge.transport,
        tipoNombre: transportLabel,

        nombre:
          edge.name ||
          `${fromNode.name} - ${toNode.name}`,

        color: getTransportColor(
          edge.transport
        ),

        duracion:
          Number(edge.durationMinutes) || 0,

        distancia:
          Number(edge.distanceKm) || 0,

        costo:
          Number(edge.costBs) || 0,

        estado: edge.status || "OPEN",

        instrucciones:
          edge.transport === "WALK"
            ? `Camina desde ${fromNode.name} hasta ${toNode.name}.`
            : `Toma ${transportLabel} desde ${fromNode.name} hasta ${toNode.name}.`,

        origen: {
          id: fromNode.id,
          nombre: fromNode.name,
          latitude: fromNode.latitude,
          longitude: fromNode.longitude,
        },

        destino: {
          id: toNode.id,
          nombre: toNode.name,
          latitude: toNode.latitude,
          longitude: toNode.longitude,
        },

        coordenadas: [
          {
            latitude: fromNode.latitude,
            longitude: fromNode.longitude,
          },
          {
            latitude: toNode.latitude,
            longitude: toNode.longitude,
          },
        ],
      };
    }
  ).filter(Boolean);

  const durationTotal = tramos.reduce(
    (total, tramo) =>
      total + tramo.duracion,
    0
  );

  const distanceTotal = tramos.reduce(
    (total, tramo) =>
      total + tramo.distancia,
    0
  );

  const costTotal = tramos.reduce(
    (total, tramo) =>
      total + tramo.costo,
    0
  );

  const allCoordinates = tramos.flatMap(
    (tramo, index) => {
      if (index === 0) {
        return tramo.coordenadas;
      }

      return [tramo.coordenadas[1]];
    }
  );

  return {
    id: `demo-route-${Date.now()}`,

    origen: originName,
    destino: destinationName,

    tramos,
    coordenadas: allCoordinates,

    resumen: {
      duracion_total: durationTotal,

      distancia_total:
        Number(distanceTotal.toFixed(2)),

      costo_estimado:
        Number(costTotal.toFixed(2)),

      transbordos: countTransfers(
        path.edges
      ),

      nodos_explorados:
        path.exploredNodesCount || 0,

      costo_algoritmo:
        Number(
          Number(path.totalCost || 0).toFixed(2)
        ),
    },

    esRutaRecalculada: isRecalculated,

    estado: isRecalculated
      ? "RECALCULATED"
      : "INITIAL",
  };
};