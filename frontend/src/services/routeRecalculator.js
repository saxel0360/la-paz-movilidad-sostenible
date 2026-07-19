import { getMinibusSegment } from './minibusRoutes';
import { getPumakatariSegment } from './pumakatariRoutes';

/**
 * Servicio para recalcular rutas cuando hay bloqueos
 */
const routeRecalculator = {
    /**
     * Recalcula una ruta evitando el punto de bloqueo
     */
    recalculateRoute: (originalRoute, blockPoint, minibusId, pumakatariId) => {
        console.log(`🔄 Recalculando ruta evitando bloqueo en: ${blockPoint.nombre}`);
        
        if (!originalRoute || !originalRoute.tramos) {
            console.warn('⚠️ Ruta original no válida');
            return null;
        }

        // Extraer los tramos originales
        const tramos = [...originalRoute.tramos];
        
        // Encontrar el tramo de minibús
        const minibusIndex = tramos.findIndex(t => t.tipo === 'MINIBUS');
        const pumakatariIndex = tramos.findIndex(t => t.tipo === 'PUMAKATARI');

        let newTramos = [...tramos];

        // Si hay minibús, recalcularlo evitando el bloqueo
        if (minibusIndex !== -1 && minibusId) {
            console.log('🚐 Recalculando minibús para evitar bloqueo');
            
            const minibusTramo = tramos[minibusIndex];
            const minibusCoords = minibusTramo.coordenadas;
            
            if (minibusCoords && minibusCoords.length > 0) {
                const fromPoint = minibusCoords[0];
                const toPoint = minibusCoords[minibusCoords.length - 1];

                // Buscar una ruta alternativa que evite el bloqueo
                const alternativeRoute = findAlternativeRoute(minibusId, fromPoint, toPoint, blockPoint);
                
                if (alternativeRoute && alternativeRoute.coordinates.length > 0) {
                    console.log(`✅ Ruta alternativa encontrada (${alternativeRoute.coordinates.length} puntos)`);
                    
                    newTramos[minibusIndex] = {
                        ...minibusTramo,
                        coordenadas: alternativeRoute.coordinates,
                        duracion: alternativeRoute.duration,
                        distancia: alternativeRoute.distance,
                        instrucciones: `Ruta alternativa evitando bloqueo en ${blockPoint.nombre}`,
                        esRutaAlternativa: true,
                        color: '#FF6B00', // Color naranja para indicar desvío
                    };
                } else {
                    console.warn('⚠️ No se encontró ruta alternativa para minibús');
                }
            }
        }

        // Si hay PumaKatari, también recalcularlo
        if (pumakatariIndex !== -1 && pumakatariId) {
            console.log('🚌 Recalculando PumaKatari para evitar bloqueo');
            
            const pumakatariTramo = tramos[pumakatariIndex];
            const pumakatariCoords = pumakatariTramo.coordenadas;
            
            if (pumakatariCoords && pumakatariCoords.length > 0) {
                const fromPoint = pumakatariCoords[0];
                const toPoint = pumakatariCoords[pumakatariCoords.length - 1];

                const alternativeRoute = findAlternativePumakatariRoute(pumakatariId, fromPoint, toPoint, blockPoint);
                
                if (alternativeRoute && alternativeRoute.coordinates.length > 0) {
                    newTramos[pumakatariIndex] = {
                        ...pumakatariTramo,
                        coordenadas: alternativeRoute.coordinates,
                        duracion: alternativeRoute.duration,
                        distancia: alternativeRoute.distance,
                        instrucciones: `Ruta alternativa evitando bloqueo en ${blockPoint.nombre}`,
                        esRutaAlternativa: true,
                        color: '#FF6B00',
                    };
                }
            }
        }

        // Recalcular totales
        let totalDuration = 0;
        let totalDistance = 0;
        let totalCosto = 0;
        newTramos.forEach(t => {
            totalDuration += t.duracion || 0;
            totalDistance += t.distancia || 0;
            if (t.costo) totalCosto += t.costo;
        });

        return {
            ...originalRoute,
            tramos: newTramos,
            resumen: {
                duracion_total: Math.round(totalDuration),
                distancia_total: parseFloat(totalDistance.toFixed(2)),
                transbordos: originalRoute.resumen.transbordos || 0,
                costo_estimado: parseFloat(totalCosto.toFixed(2)),
            },
            esRutaRecalculada: true,
            bloqueoEvitado: blockPoint,
        };
    },
};

/**
 * Encuentra una ruta alternativa para minibús que evite el bloqueo
 */
const findAlternativeRoute = (minibusId, fromPoint, toPoint, blockPoint) => {
    // Simulación: crear una ruta alternativa con un desvío
    const offset = 0.008; // ~800 metros de desvío
    
    // Calcular dirección del desvío (alejándose del bloqueo)
    const dx = toPoint.latitude - fromPoint.latitude;
    const dy = toPoint.longitude - fromPoint.longitude;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    
    // Puntos intermedios para evitar el bloqueo
    const detourPoints = [
        { 
            latitude: fromPoint.latitude + dx * 0.3 + offset * (dy/len) * 0.5, 
            longitude: fromPoint.longitude + dy * 0.3 - offset * (dx/len) * 0.5 
        },
        { 
            latitude: (fromPoint.latitude + toPoint.latitude) / 2 + offset * 0.7, 
            longitude: (fromPoint.longitude + toPoint.longitude) / 2 - offset * 0.5 
        },
        { 
            latitude: toPoint.latitude - dx * 0.3 + offset * (dy/len) * 0.5, 
            longitude: toPoint.longitude - dy * 0.3 - offset * (dx/len) * 0.5 
        },
    ];

    const alternativeCoords = [
        fromPoint,
        ...detourPoints,
        toPoint
    ];

    return {
        coordinates: alternativeCoords,
        duration: Math.round(alternativeCoords.length * 3.5),
        distance: parseFloat((alternativeCoords.length * 0.5).toFixed(2)),
    };
};

/**
 * Encuentra una ruta alternativa para PumaKatari
 */
const findAlternativePumakatariRoute = (pumakatariId, fromPoint, toPoint, blockPoint) => {
    const offset = 0.006;
    
    const dx = toPoint.latitude - fromPoint.latitude;
    const dy = toPoint.longitude - fromPoint.longitude;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    
    const detourPoints = [
        { 
            latitude: fromPoint.latitude + dx * 0.4 + offset * (dy/len) * 0.4, 
            longitude: fromPoint.longitude + dy * 0.4 - offset * (dx/len) * 0.4 
        },
        { 
            latitude: (fromPoint.latitude + toPoint.latitude) / 2 + offset * 0.6, 
            longitude: (fromPoint.longitude + toPoint.longitude) / 2 + offset * 0.3 
        },
        { 
            latitude: toPoint.latitude - dx * 0.2 + offset * (dy/len) * 0.4, 
            longitude: toPoint.longitude - dy * 0.2 - offset * (dx/len) * 0.4 
        },
    ];

    return {
        coordinates: [fromPoint, ...detourPoints, toPoint],
        duration: Math.round(detourPoints.length * 3.5),
        distance: parseFloat((detourPoints.length * 0.6).toFixed(2)),
    };
};

export { routeRecalculator };
export default routeRecalculator;