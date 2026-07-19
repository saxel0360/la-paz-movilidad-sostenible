import { getTelefericoSegment } from './telefericoRoutes';
import { getMinibusSegment } from './minibusRoutes';

/**
 * Servicio para calcular rutas combinadas (Teleférico + Minibús)
 */
export const getCombinedRoute = (telefericoId, minibusId, origin, destination) => {
    console.log(`🔄 Calculando ruta combinada: ${telefericoId} + ${minibusId}`);
    
    // 1. Obtener segmento de teleférico
    const telefericoSegment = getTelefericoSegment(
        telefericoId,
        origin,
        destination,
        'forward'
    );

    // 2. Obtener segmento de minibús
    const minibusSegment = getMinibusSegment(
        minibusId,
        origin,
        destination,
        'forward'
    );

    // Si ambos existen, combinarlos
    if (telefericoSegment && minibusSegment) {
        // Tomar primera parte del teleférico y segunda parte del minibús
        // O viceversa, dependiendo de las coordenadas
        
        // Determinar punto de transbordo (donde se conectan)
        const telefericoEnd = telefericoSegment.coordinates[telefericoSegment.coordinates.length - 1];
        const minibusStart = minibusSegment.coordinates[0];
        
        // Encontrar el punto de conexión más cercano
        const transferPoint = findClosestPoint(telefericoSegment.coordinates, minibusSegment.coordinates);
        
        // Dividir los segmentos en el punto de transbordo
        const telefericoPart = splitRouteAtPoint(telefericoSegment.coordinates, transferPoint);
        const minibusPart = splitRouteAtPoint(minibusSegment.coordinates, transferPoint, 'forward');
        
        // Construir ruta combinada
        return {
            id: `combined_${Date.now()}`,
            tramos: [
                {
                    id: 'teleferico_1',
                    tipo: 'TELEFERICO',
                    nombre: telefericoSegment.nombre,
                    color: telefericoSegment.color,
                    duracion: Math.round(telefericoPart.duration || telefericoSegment.duration / 2),
                    distancia: parseFloat((telefericoPart.distance || telefericoSegment.distance / 2).toFixed(2)),
                    coordenadas: telefericoPart.coordinates,
                    instrucciones: `Aborda el ${telefericoSegment.nombre} desde ${telefericoSegment.paradas[0]} hasta ${telefericoSegment.paradas[telefericoSegment.paradas.length - 1]}`,
                    costo: telefericoSegment.costo,
                    paradas: telefericoSegment.paradas,
                },
                {
                    id: 'minibus_1',
                    tipo: 'MINIBUS',
                    nombre: minibusSegment.nombre,
                    color: minibusSegment.color,
                    duracion: Math.round(minibusPart.duration || minibusSegment.duration / 2),
                    distancia: parseFloat((minibusPart.distance || minibusSegment.distance / 2).toFixed(2)),
                    coordenadas: minibusPart.coordinates,
                    instrucciones: `Transborda al ${minibusSegment.nombre} hacia ${minibusSegment.paradas[minibusSegment.paradas.length - 1]}`,
                    costo: minibusSegment.costo,
                    paradas: minibusSegment.paradas,
                },
            ],
            resumen: {
                duracion_total: Math.round((telefericoSegment.duration + minibusSegment.duration) / 2),
                distancia_total: parseFloat(((telefericoSegment.distance + minibusSegment.distance) / 2).toFixed(2)),
                transbordos: 1,
                costo_estimado: telefericoSegment.costo + minibusSegment.costo,
            },
        };
    }
    
    return null;
};

/**
 * Encuentra el punto más cercano entre dos rutas
 */
const findClosestPoint = (coords1, coords2) => {
    let minDistance = Infinity;
    let closestPoint = coords2[0];
    
    for (const point1 of coords1) {
        for (const point2 of coords2) {
            const distance = Math.sqrt(
                Math.pow(point1.latitude - point2.latitude, 2) +
                Math.pow(point1.longitude - point2.longitude, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point2;
            }
        }
    }
    
    return closestPoint;
};

/**
 * Divide una ruta en el punto especificado
 */
const splitRouteAtPoint = (coordinates, splitPoint, direction = 'forward') => {
    let splitIndex = 0;
    let minDistance = Infinity;
    
    coordinates.forEach((coord, index) => {
        const distance = Math.sqrt(
            Math.pow(coord.latitude - splitPoint.latitude, 2) +
            Math.pow(coord.longitude - splitPoint.longitude, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            splitIndex = index;
        }
    });
    
    if (direction === 'forward') {
        return {
            coordinates: coordinates.slice(0, splitIndex + 1),
            duration: splitIndex * 2,
            distance: splitIndex * 0.4,
        };
    } else {
        return {
            coordinates: coordinates.slice(splitIndex),
            duration: (coordinates.length - splitIndex) * 2,
            distance: (coordinates.length - splitIndex) * 0.4,
        };
    }
};