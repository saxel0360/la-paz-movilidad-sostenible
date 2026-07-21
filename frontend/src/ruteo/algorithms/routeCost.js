/**
 * Calcula el costo de recorrer una arista del grafo.
 *
 * El costo puede considerar:
 * - Tiempo
 * - Precio
 * - Caminata
 * - Riesgo
 * - Congestión
 * - Bloqueos
 *
 * @param {Object} edge
 * @param {Object} preferences
 * @returns {number}
 */
export const calculateEdgeCost = (
  edge,
  preferences = {}
) => {
  if (!edge) {
    return Infinity;
  }

  const {
    fastest = true,
    lowCost = false,
    lessWalking = false,
    safer = false,
  } = preferences;

  if (edge.status === "BLOCKED") {
    return Infinity;
  }

  const durationMinutes =
    Number(edge.durationMinutes) || 0;

  const costBs =
    Number(edge.costBs) || 0;

  const distanceKm =
    Number(edge.distanceKm) || 0;

  const riskScore =
    Number(edge.riskScore) || 0;

  let totalCost = 0;

  if (fastest) {
    totalCost += durationMinutes;
  }

  if (lowCost) {
    totalCost += costBs * 3;
  }

  if (
    lessWalking &&
    edge.transport === "WALK"
  ) {
    totalCost += distanceKm * 10;
  }

  if (safer) {
    totalCost += riskScore * 5;
  }

  if (edge.status === "CONGESTED") {
    const trafficMultiplier =
      Number(edge.trafficMultiplier) || 1.8;

    totalCost *= trafficMultiplier;
  }

  if (edge.status === "PARTIAL") {
    const partialMultiplier =
      Number(edge.trafficMultiplier) || 1.4;

    totalCost *= partialMultiplier;
  }

  /*
   * Evita que una arista sin preferencias
   * configuradas tenga costo cero.
   */
  if (totalCost === 0) {
    totalCost =
      durationMinutes +
      distanceKm +
      costBs;
  }

  return totalCost;
};