import { OSRMClient, ROUTE_PROFILES } from './osrmService';

/**
 * Servicio para generar rutas multimodales
 * Combina caminata + teleférico + minibús
 */
export class MultimodalRouteService {
    /**
     * Calcula una ruta multimodal completa
     * @param {Object} origin - Punto de origen
     * @param {Object} destination - Punto de destino
     * @param {Array} waypoints - Puntos intermedios (estaciones, paradas)
     * @returns {Promise<Object>} Ruta multimodal
     */
    static async calculateRoute(origin, destination, waypoints = []) {
        try {
            // 1. Obtener ruta de caminata al primer waypoint
            const walkToFirst = await OSRMClient.getWalkingRoute(origin, waypoints[0]);
            
            // 2. Obtener ruta de vehículo entre waypoints (minibús)
            const drivingSegments = [];
            for (let i = 0; i < waypoints.length - 1; i++) {
                const segment = await OSRMClient.getDrivingRoute(waypoints[i], waypoints[i + 1]);
                drivingSegments.push(segment);
            }
            
            // 3. Obtener ruta de caminata final
            const walkToDestination = await OSRMClient.getWalkingRoute(
                waypoints[waypoints.length - 1], 
                destination
            );
            
            // 4. Combinar todos los segmentos
            return this._combineSegments({
                walkToFirst,
                drivingSegments,
                walkToDestination,
                waypoints,
            });
        } catch (error) {
            console.error('Error calculando ruta multimodal:', error);
            // Fallback: ruta en línea recta
            return this._generateFallbackRoute(origin, destination);
        }
    }

    /**
     * Combina todos los segmentos en una sola ruta
     */
    static _combineSegments({ walkToFirst, drivingSegments, walkToDestination, waypoints }) {
        // Extraer todas las coordenadas
        const allCoordinates = [];
        const tramos = [];
        let totalDistance = 0;
        let totalDuration = 0;

        // 1. Caminata inicial
        if (walkToFirst && walkToFirst.coordinates) {
            allCoordinates.push(...walkToFirst.coordinates);
            tramos.push({
                id: 'walk_1',
                tipo: 'WALK',
                nombre: 'Caminata inicial',
                color: '#34C759',
                duracion: walkToFirst.duration,
                distancia: walkToFirst.distance,
                coordenadas: walkToFirst.coordinates,
                instrucciones: 'Camina a la primera parada',
                modo: 'walking',
            });
            totalDistance += walkToFirst.distance;
            totalDuration += walkToFirst.duration;
        }

        // 2. Segmentos en minibús
        drivingSegments.forEach((segment, index) => {
            if (segment && segment.coordinates) {
                // Solo agregar coordenadas (evitar duplicados)
                const startIndex = allCoordinates.length > 0 ? 1 : 0;
                allCoordinates.push(...segment.coordinates.slice(startIndex));
                
                tramos.push({
                    id: `driving_${index + 1}`,
                    tipo: 'MINIBUS',
                    nombre: `Minibús Ruta ${index + 1}`,
                    color: '#FF9500',
                    duracion: segment.duration,
                    distancia: segment.distance,
                    coordenadas: segment.coordinates,
                    instrucciones: `Toma minibús desde ${waypoints[index].nombre || 'parada'} hasta ${waypoints[index + 1].nombre || 'parada'}`,
                    modo: 'driving',
                });
                totalDistance += segment.distance;
                totalDuration += segment.duration;
            }
        });

        // 3. Caminata final
        if (walkToDestination && walkToDestination.coordinates) {
            const startIndex = allCoordinates.length > 0 ? 1 : 0;
            allCoordinates.push(...walkToDestination.coordinates.slice(startIndex));
            tramos.push({
                id: 'walk_2',
                tipo: 'WALK',
                nombre: 'Caminata final',
                color: '#34C759',
                duracion: walkToDestination.duration,
                distancia: walkToDestination.distance,
                coordenadas: walkToDestination.coordinates,
                instrucciones: 'Camina a tu destino final',
                modo: 'walking',
            });
            totalDistance += walkToDestination.distance;
            totalDuration += walkToDestination.duration;
        }

        return {
            id: `multimodal_${Date.now()}`,
            coordenadas_completas: allCoordinates,
            tramos,
            resumen: {
                duracion_total: totalDuration,
                distancia_total: totalDistance,
                transbordos: drivingSegments.length,
                costo_estimado: totalDistance * 1.5, // Estimación simple
            },
        };
    }

    /**
     * Ruta de fallback
     */
    static _generateFallbackRoute(origin, destination) {
        return {
            id: `fallback_${Date.now()}`,
            tramos: [{
                id: 'fallback_1',
                tipo: 'WALK',
                nombre: 'Caminata directa',
                color: '#34C759',
                duracion: 30,
                distancia: 2.5,
                coordenadas: [
                    origin,
                    { latitude: (origin.latitude + destination.latitude) / 2, longitude: (origin.longitude + destination.longitude) / 2 },
                    destination,
                ],
                instrucciones: 'Camina directamente a tu destino',
                modo: 'walking',
            }],
            resumen: {
                duracion_total: 30,
                distancia_total: 2.5,
                transbordos: 0,
                costo_estimado: 0,
            },
        };
    }
}