/**
 * Convierte grados a radianes.
 *
 * @param {number} degrees
 * @returns {number}
 */
const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calcula la distancia entre dos coordenadas geográficas
 * utilizando la fórmula de Haversine.
 *
 * El resultado se devuelve en kilómetros.
 *
 * @param {{ latitude: number, longitude: number }} pointA
 * @param {{ latitude: number, longitude: number }} pointB
 * @returns {number}
 */
export const haversineKm = (pointA, pointB) => {
  if (!pointA || !pointB) {
    return 0;
  }

  const {
    latitude: latitudeA,
    longitude: longitudeA,
  } = pointA;

  const {
    latitude: latitudeB,
    longitude: longitudeB,
  } = pointB;

  const hasInvalidCoordinates =
    typeof latitudeA !== "number" ||
    typeof longitudeA !== "number" ||
    typeof latitudeB !== "number" ||
    typeof longitudeB !== "number";

  if (hasInvalidCoordinates) {
    return 0;
  }

  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(
    latitudeB - latitudeA
  );

  const longitudeDifference = toRadians(
    longitudeB - longitudeA
  );

  const latitudeARadians = toRadians(latitudeA);
  const latitudeBRadians = toRadians(latitudeB);

  const haversineValue =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(latitudeARadians) *
      Math.cos(latitudeBRadians) *
      Math.sin(longitudeDifference / 2) ** 2;

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(haversineValue),
      Math.sqrt(1 - haversineValue)
    );

  return earthRadiusKm * angularDistance;
};