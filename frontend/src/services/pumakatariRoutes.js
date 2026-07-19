/**
 * Rutas de PumaKatari - La Paz, Bolivia
 * Basadas en datos reales del sistema PumaKatari
 */

export const PUMAKATARI_ROUTES = {
    // ============================================
    // LÍNEA VERDE - PumaKatari
    // ============================================
    'pumakatari_verde': {
        id: 'pumakatari_verde',
        nombre: 'PumaKatari Línea Verde',
        descripcion: 'Zona Sur → Centro → El Alto',
        operador: 'Gobierno Municipal de La Paz',
        color: '#34C759',
        costo: 2.00,
        horario: '06:00 - 22:00',
        frecuencia: '8-12 min',
        tipo: 'PUMAKATARI',
        paradas: [
            { lat: -16.5255, lng: -68.1185, nombre: 'Parada Zona Sur' },
            { lat: -16.5200, lng: -68.1200, nombre: 'Parada Obrajes' },
            { lat: -16.5140, lng: -68.1220, nombre: 'Parada Av. Ballivián' },
            { lat: -16.5080, lng: -68.1250, nombre: 'Parada Calle 16' },
            { lat: -16.5000, lng: -68.1310, nombre: 'Parada Plaza del Estudiante' },
            { lat: -16.4971, lng: -68.1367, nombre: 'Parada Estación Central' },
            { lat: -16.4920, lng: -68.1450, nombre: 'Parada Av. América' },
            { lat: -16.4880, lng: -68.1500, nombre: 'Parada El Alto' },
        ],
    },
};

/**
 * Obtiene la ruta de un PumaKatari entre dos paradas
 */
export const getPumakatariSegment = (routeId, fromStop, toStop, direction = 'forward') => {
    const route = PUMAKATARI_ROUTES[routeId];
    if (!route) {
        console.warn(`Ruta PumaKatari no encontrada: ${routeId}`);
        return null;
    }

    const stops = route.paradas;
    
    const findStopIndex = (stop) => {
        if (typeof stop === 'string') {
            let index = stops.findIndex(s => s.nombre === stop);
            if (index !== -1) return index;
            
            index = stops.findIndex(s => 
                s.nombre.toLowerCase().includes(stop.toLowerCase()) ||
                stop.toLowerCase().includes(s.nombre.toLowerCase())
            );
            if (index !== -1) return index;
            return -1;
        }
        
        if (stop.nombre) {
            let index = stops.findIndex(s => s.nombre === stop.nombre);
            if (index !== -1) return index;
            
            const words = stop.nombre.toLowerCase().split(' ');
            for (const word of words) {
                if (word.length < 3) continue;
                const idx = stops.findIndex(s => 
                    s.nombre.toLowerCase().includes(word)
                );
                if (idx !== -1) return idx;
            }
            return -1;
        }
        
        if (stop.lat && stop.lng) {
            const index = stops.findIndex(s => 
                Math.abs(s.lat - stop.lat) < 0.005 &&
                Math.abs(s.lng - stop.lng) < 0.005
            );
            if (index !== -1) return index;
        }
        return -1;
    };

    const fromIndex = findStopIndex(fromStop);
    const toIndex = findStopIndex(toStop);

    if (fromIndex === -1 || toIndex === -1) {
        console.warn(`No se encontraron paradas. Usando ruta COMPLETA de ${route.nombre}`);
        return getSegmentFromIndices(route, 0, stops.length - 1, direction);
    }

    if (fromIndex === toIndex) {
        console.warn(`Origen y destino son la misma parada. Usando ruta COMPLETA de ${route.nombre}`);
        return getSegmentFromIndices(route, 0, stops.length - 1, direction);
    }

    return getSegmentFromIndices(route, fromIndex, toIndex, direction);
};

const getSegmentFromIndices = (route, fromIndex, toIndex, direction) => {
    const stops = route.paradas;
    let start, end;
    if (direction === 'forward' && fromIndex <= toIndex) {
        start = fromIndex;
        end = toIndex;
    } else if (direction === 'backward' && fromIndex >= toIndex) {
        start = toIndex;
        end = fromIndex;
    } else {
        start = Math.min(fromIndex, toIndex);
        end = Math.max(fromIndex, toIndex);
    }

    const segmentStops = stops.slice(start, end + 1);
    const finalStops = (direction === 'backward' && fromIndex > toIndex) 
        ? [...segmentStops].reverse() 
        : segmentStops;

    const numStops = finalStops.length;
    const distance = numStops * 0.5;
    const duration = numStops * 2;

    return {
        routeId: route.id,
        coordinates: finalStops.map(s => ({ latitude: s.lat, longitude: s.lng })),
        distance: parseFloat(distance.toFixed(2)),
        duration: Math.round(duration),
        nombre: route.nombre,
        color: route.color,
        costo: route.costo,
        paradas: finalStops.map(s => s.nombre),
        horario: route.horario,
        frecuencia: route.frecuencia,
        operador: route.operador,
        tipo: 'PUMAKATARI',
    };
};