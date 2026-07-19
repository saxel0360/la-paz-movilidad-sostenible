import axios from 'axios';

// Configuración de OSRM
const OSRM_URL = 'https://router.project-osrm.org';

// Cache simple para evitar llamadas repetidas
const routeCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Perfiles de ruteo disponibles
 */
export const ROUTE_PROFILES = {
    WALK: 'walking',     // Para peatones
    DRIVING: 'driving',  // Para vehículos (minibuses)
    BIKE: 'bicycling',   // Para bicicletas
};

/**
 * Cliente para OSRM - Calcula rutas sobre calles reales
 */
export class OSRMClient {
    /**
     * Calcula una ruta usando el perfil especificado
     * @param {Object} origin - {latitude, longitude}
     * @param {Object} destination - {latitude, longitude}
     * @param {string} profile - 'walking' | 'driving' | 'bicycling'
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<Object>} Ruta con coordenadas y metadata
     */
    static async getRoute(origin, destination, profile = 'walking', options = {}) {
        const cacheKey = this._generateCacheKey(origin, destination, profile);
        
        // Verificar cache
        if (routeCache.has(cacheKey)) {
            const cached = routeCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                console.log(`🔄 Usando ruta cacheada: ${cacheKey}`);
                return cached.data;
            }
            routeCache.delete(cacheKey);
        }

        try {
            console.log(`🌐 Consultando OSRM: ${origin.latitude},${origin.longitude} → ${destination.latitude},${destination.longitude} (${profile})`);
            
            const response = await axios.get(
                `${OSRM_URL}/route/v1/${profile}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`,
                {
                    params: {
                        overview: 'full',          // Devuelve geometría completa
                        geometries: 'geojson',      // Formato GeoJSON
                        steps: true,               // Instrucciones paso a paso
                        alternatives: false,       // Solo una ruta (más rápido)
                        continue_straight: false,   // Optimizar ruta
                        ...options
                    },
                    timeout: 10000, // 10 segundos de timeout
                }
            );

            if (!response.data.routes || response.data.routes.length === 0) {
                throw new Error('No se encontró ruta');
            }

            const route = response.data.routes[0];
            const routeData = this._parseRouteResponse(route, response.data.waypoints);
            
            // Guardar en cache
            routeCache.set(cacheKey, {
                data: routeData,
                timestamp: Date.now()
            });

            console.log(`✅ Ruta calculada: ${routeData.distance.toFixed(2)} km, ${routeData.duration.toFixed(0)} min`);
            
            return routeData;
        } catch (error) {
            console.error('❌ Error en OSRM:', error.message);
            // Fallback: línea recta
            return this._generateFallbackRoute(origin, destination);
        }
    }

    /**
     * Calcula ruta de caminata (específico)
     */
    static async getWalkingRoute(origin, destination, options = {}) {
        return this.getRoute(origin, destination, ROUTE_PROFILES.WALK, options);
    }

    /**
     * Calcula ruta para vehículos (minibuses)
     */
    static async getDrivingRoute(origin, destination, options = {}) {
        return this.getRoute(origin, destination, ROUTE_PROFILES.DRIVING, options);
    }

    /**
     * Procesa la respuesta de OSRM
     */
    static _parseRouteResponse(route, waypoints) {
        // Extraer coordenadas del GeoJSON
        const coordinates = route.geometry.coordinates.map(coord => ({
            longitude: coord[0],
            latitude: coord[1],
        }));

        // Extraer instrucciones si existen
        const steps = route.legs[0]?.steps || [];
        const instructions = steps.map(step => ({
            instruction: step.maneuver?.instruction || '',
            distance: step.distance,
            duration: step.duration,
            type: step.maneuver?.type || '',
            location: step.maneuver?.location ? {
                latitude: step.maneuver.location[1],
                longitude: step.maneuver.location[0],
            } : null,
        }));

        return {
            coordinates,
            distance: route.distance / 1000, // metros → kilómetros
            duration: route.duration / 60,   // segundos → minutos
            weight: route.weight,
            instructions,
            summary: route.legs[0]?.summary || '',
            waypoints: waypoints.map(wp => ({
                latitude: wp.location[1],
                longitude: wp.location[0],
            })),
        };
    }

    /**
     * Genera ruta de fallback (línea recta con puntos intermedios)
     */
    static _generateFallbackRoute(origin, destination, segments = 20) {
        const coordinates = [];
        for (let i = 0; i <= segments; i++) {
            const fraction = i / segments;
            coordinates.push({
                latitude: origin.latitude + (destination.latitude - origin.latitude) * fraction,
                longitude: origin.longitude + (destination.longitude - origin.longitude) * fraction,
            });
        }

        // Calcular distancia aproximada (Haversine)
        const distance = this._haversineDistance(origin, destination);

        return {
            coordinates,
            distance,
            duration: distance / 5 * 60, // 5 km/h => minutos
            isFallback: true,
            instructions: [],
        };
    }

    /**
     * Distancia Haversine entre dos puntos
     */
    static _haversineDistance(point1, point2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
        const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Genera clave de cache
     */
    static _generateCacheKey(origin, destination, profile) {
        const o = `${origin.latitude.toFixed(6)},${origin.longitude.toFixed(6)}`;
        const d = `${destination.latitude.toFixed(6)},${destination.longitude.toFixed(6)}`;
        return `${profile}|${o}|${d}`;
    }
}