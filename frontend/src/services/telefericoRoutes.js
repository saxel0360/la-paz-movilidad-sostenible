/**
 * Rutas de Teleférico - Mi Teleférico La Paz
 * Basadas en datos reales del sistema de teleférico
 */

export const TELEFERICO_ROUTES = {
    // ============================================
    // LÍNEA MORADA - El Alto → Centro
    // ============================================
    'linea_morada': {
        id: 'linea_morada',
        nombre: 'Línea Morada',
        descripcion: 'El Alto (Av. 6 de Marzo) → Centro (Calle Murillo)',
        operador: 'Mi Teleférico',
        color: '#9B59B6',
        costo: 3.00,
        horario: '06:00 - 23:00',
        frecuencia: '4-6 min',
        tipo: 'TELEFERICO',
        paradas: [
            { 
                lat: -16.5180, 
                lng: -68.1650, 
                nombre: 'Estación 6 de Marzo (El Alto)' 
            },
            { 
                lat: -16.5100, 
                lng: -68.1550, 
                nombre: 'Estación Juan Pablo II' 
            },
            { 
                lat: -16.5050, 
                lng: -68.1450, 
                nombre: 'Estación Naciones Unidas' 
            },
            { 
                lat: -16.4980, 
                lng: -68.1380, 
                nombre: 'Estación Calle Murillo (Centro)' 
            },
        ],
    },

    // ============================================
    // LÍNEA AMARILLA - Ciudad Satélite → Curva de Olguin
    // ============================================
    'linea_amarilla': {
        id: 'linea_amarilla',
        nombre: 'Línea Amarilla',
        descripcion: 'Ciudad Satélite → Curva de Olguin',
        operador: 'Mi Teleférico',
        color: '#F1C40F',
        costo: 3.00,
        horario: '06:00 - 23:00',
        frecuencia: '4-6 min',
        tipo: 'TELEFERICO',
        paradas: [
            { 
                lat: -16.5300, 
                lng: -68.1800, 
                nombre: 'Estación Ciudad Satélite' 
            },
            { 
                lat: -16.5220, 
                lng: -68.1700, 
                nombre: 'Estación 16 de Julio' 
            },
            { 
                lat: -16.5150, 
                lng: -68.1600, 
                nombre: 'Estación Av. 6 de Marzo' 
            },
            { 
                lat: -16.5080, 
                lng: -68.1500, 
                nombre: 'Estación Curva de Olguin' 
            },
        ],
    },

    // ============================================
    // LÍNEA ROJA - Estación Central → Obrajes
    // ============================================
    'linea_roja': {
        id: 'linea_roja',
        nombre: 'Línea Roja',
        descripcion: 'Estación Central → Obrajes',
        operador: 'Mi Teleférico',
        color: '#E74C3C',
        costo: 3.00,
        horario: '06:00 - 23:00',
        frecuencia: '4-6 min',
        tipo: 'TELEFERICO',
        paradas: [
            { 
                lat: -16.4971, 
                lng: -68.1367, 
                nombre: 'Estación Central' 
            },
            { 
                lat: -16.5020, 
                lng: -68.1300, 
                nombre: 'Estación Av. 6 de Agosto' 
            },
            { 
                lat: -16.5080, 
                lng: -68.1250, 
                nombre: 'Estación Calle 16' 
            },
            { 
                lat: -16.5140, 
                lng: -68.1220, 
                nombre: 'Estación Av. Ballivián' 
            },
            { 
                lat: -16.5200, 
                lng: -68.1200, 
                nombre: 'Estación Obrajes' 
            },
        ],
    },
};

/**
 * Obtiene la ruta de un teleférico entre dos estaciones (VERSIÓN MEJORADA)
 */
export const getTelefericoSegment = (routeId, fromStop, toStop, direction = 'forward') => {
    const route = TELEFERICO_ROUTES[routeId];
    if (!route) {
        console.warn(`Ruta de teleférico no encontrada: ${routeId}`);
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

    // 🔧 SI NO ENCUENTRA LAS ESTACIONES, USAR TODA LA RUTA COMPLETA
    if (fromIndex === -1 || toIndex === -1) {
        console.warn(`No se encontraron estaciones. Usando ruta COMPLETA de ${route.nombre}`);
        console.log(`   Ruta completa tiene ${stops.length} estaciones`);
        
        // Usar TODA la ruta (primera a última estación)
        return getSegmentFromIndices(route, 0, stops.length - 1, direction);
    }

    // Si encuentra las estaciones pero son la misma, usar toda la ruta
    if (fromIndex === toIndex) {
        console.warn(`Origen y destino son la misma estación. Usando ruta COMPLETA de ${route.nombre}`);
        return getSegmentFromIndices(route, 0, stops.length - 1, direction);
    }

    return getSegmentFromIndices(route, fromIndex, toIndex, direction);
};

/**
 * Función auxiliar para obtener segmento desde índices
 */
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
    const distance = numStops * 0.8;
    const duration = numStops * 2;

    return {
        routeId: route.id,
        coordinates: finalStops.map(s => ({ 
            latitude: s.lat, 
            longitude: s.lng 
        })),
        distance: parseFloat(distance.toFixed(2)),
        duration: Math.round(duration),
        nombre: route.nombre,
        color: route.color,
        costo: route.costo,
        paradas: finalStops.map(s => s.nombre),
        horario: route.horario,
        frecuencia: route.frecuencia,
        operador: route.operador,
        tipo: 'TELEFERICO',
    };
};