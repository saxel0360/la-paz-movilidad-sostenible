/**
 * Rutas de minibuses personalizadas - La Paz, Bolivia
 * Basadas en datos reales de transporte público
 */

export const MINIBUS_ROUTES = {
    // ============================================
    // CASO 1: ESTUDIANTE - Zona Sur → UMSA
    // ============================================
    'ruta_44': {
        id: 'ruta_44',
        nombre: 'Ruta 44',
        descripcion: 'Zona Sur → Obrajes → Centro (UMSA)',
        operador: 'Sindicato de Minibuses 44',
        color: '#FF9500',
        costo: 2.50,
        horario: '06:00 - 22:00',
        frecuencia: '10-15 min',
        paradas: [
            { lat: -16.5255, lng: -68.1185, nombre: 'Zona Sur (Calle 21)' },
            { lat: -16.5225, lng: -68.1190, nombre: 'Calle 21 esq. 22' },
            { lat: -16.5200, lng: -68.1200, nombre: 'Rotonda Obrajes' },
            { lat: -16.5170, lng: -68.1215, nombre: 'Av. Ballivián' },
            { lat: -16.5140, lng: -68.1220, nombre: 'Av. Ballivián esq. 14' },
            { lat: -16.5100, lng: -68.1240, nombre: 'Av. 6 de Agosto' },
            { lat: -16.5080, lng: -68.1250, nombre: 'Calle 16' },
            { lat: -16.5040, lng: -68.1280, nombre: 'Av. Arce' },
            { lat: -16.5000, lng: -68.1310, nombre: 'Plaza del Estudiante' },
            { lat: -16.4971, lng: -68.1367, nombre: 'Estación Central (UMSA)' },
        ],
    },

    // ============================================
    // CASO 2: TRABAJADOR - El Alto → Centro La Paz
    // ============================================
    'ruta_22': {
        id: 'ruta_22',
        nombre: 'Ruta 22',
        descripcion: 'Curva de Olguin (Conexión Teleférico) → Centro La Paz',
        operador: 'Sindicato de Minibuses 22',
        color: '#007AFF',
        costo: 3.00,
        horario: '05:30 - 23:00',
        frecuencia: '5-8 min',
        paradas: [
            // 🔧 PRIMERA PARADA: Conexión con Teleférico Amarillo
            { lat: -16.5080, lng: -68.1500, nombre: 'Estación Curva de Olguin (Teleférico)' },
            { lat: -16.5050, lng: -68.1450, nombre: 'Puente Trillizos' },
            { lat: -16.5000, lng: -68.1400, nombre: 'Av. Gral. San Martín' },
            { lat: -16.4971, lng: -68.1367, nombre: 'Estación Central (Centro)' },
        ],
    },

    // ============================================
    // CASO 3: TURISTA - Miraflores → Zona Sur (Parque Urbano)
    // ============================================
    'ruta_33': {
        id: 'ruta_33',
        nombre: 'Ruta 33',
        descripcion: 'Miraflores → Zona Sur (Parque Urbano Central)',
        operador: 'Sindicato de Minibuses 33',
        color: '#AF52DE',
        costo: 2.80,
        horario: '06:30 - 21:30',
        frecuencia: '12-15 min',
        paradas: [
            { lat: -16.4900, lng: -68.1400, nombre: 'Miraflores (Hospital)' },
            { lat: -16.4920, lng: -68.1380, nombre: 'Av. Colombia' },
            { lat: -16.4958, lng: -68.1333, nombre: 'Plaza Murillo' },
            { lat: -16.4971, lng: -68.1367, nombre: 'Estación Central' },
            { lat: -16.5000, lng: -68.1310, nombre: 'Plaza del Estudiante' },
            { lat: -16.5080, lng: -68.1250, nombre: 'Calle 16' },
            { lat: -16.5140, lng: -68.1220, nombre: 'Av. Ballivián' },
            { lat: -16.5200, lng: -68.1200, nombre: 'Obrajes' },
            { lat: -16.5255, lng: -68.1185, nombre: 'Zona Sur (Parque Urbano)' },
        ],
    },
};

/**
 * Obtiene la ruta de un minibús entre dos paradas (VERSIÓN MEJORADA)
 * @param {string} routeId - ID de la ruta (ej: 'ruta_44')
 * @param {Object} fromStop - { nombre, lat, lng } o coordenadas
 * @param {Object} toStop - { nombre, lat, lng } o coordenadas
 * @param {string} direction - 'forward' o 'backward'
 * @returns {Object|null} Segmento de ruta
 */
export const getMinibusSegment = (routeId, fromStop, toStop, direction = 'forward') => {
    const route = MINIBUS_ROUTES[routeId];
    if (!route) {
        console.warn(`Ruta no encontrada: ${routeId}`);
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

    // 🔧 SI NO ENCUENTRA LAS PARADAS, USAR TODA LA RUTA COMPLETA
    if (fromIndex === -1 || toIndex === -1) {
        console.warn(`No se encontraron paradas. Usando ruta COMPLETA de ${route.nombre}`);
        console.log(`   Ruta completa tiene ${stops.length} paradas`);

        // Usar TODA la ruta (primera a última parada)
        return getSegmentFromIndices(route, 0, stops.length - 1, direction);
    }

    // Si encuentra las paradas pero son la misma, usar toda la ruta
    if (fromIndex === toIndex) {
        console.warn(`Origen y destino son la misma parada. Usando ruta COMPLETA de ${route.nombre}`);
        return getSegmentFromIndices(route, 0, stops.length - 1, direction);
    }

    return getSegmentFromIndices(route, fromIndex, toIndex, direction);
};

/**
 * Función auxiliar para obtener segmento desde índices
 */
const getSegmentFromIndices = (route, fromIndex, toIndex, direction) => {
    const stops = route.paradas;

    // Determinar dirección
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

    // Si la dirección es backward, invertir
    const finalStops = (direction === 'backward' && fromIndex > toIndex)
        ? [...segmentStops].reverse()
        : segmentStops;

    // Calcular distancia y tiempo estimados
    const numStops = finalStops.length;
    const distance = numStops * 0.4; // 400m entre paradas
    const duration = numStops * 2.5; // 2.5 min por parada

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
    };
};

/**
 * Casos de prueba predefinidos
 */
export const TEST_CASES = {
    'estudiante': {
        id: 'estudiante',
        nombre: '🎓 Estudiante - Zona Sur → UMSA',
        descripcion: 'Viaje típico de un estudiante desde Zona Sur a la UMSA',
        // 🔧 Usar nombres exactos de las paradas
        origen: {
            lat: -16.5255,
            lng: -68.1185,
            nombre: 'Zona Sur (Calle 21)'  // ← Nombre exacto de la parada
        },
        destino: {
            lat: -16.4971,
            lng: -68.1367,
            nombre: 'Estación Central (UMSA)'  // ← Nombre exacto de la parada
        },
        ruta_minibus: 'ruta_44',
        modo: 'ESTUDIANTE',
    },
    'trabajador': {
        id: 'trabajador',
        nombre: '💼 Trabajador - El Alto → Centro',
        descripcion: 'Viaje de un trabajador desde El Alto al centro de La Paz',
        origen: {
            lat: -16.5180,
            lng: -68.1650,
            nombre: 'Ceja El Alto (Terminal)'  // ← Nombre exacto
        },
        destino: {
            lat: -16.4971,
            lng: -68.1367,
            nombre: 'Estación Central (Centro)'  // ← Nombre exacto
        },
        ruta_minibus: 'ruta_22',
        modo: 'TRABAJADOR',
    },
    'turista': {
        id: 'turista',
        nombre: '🏛️ Turista - Miraflores → Parque Urbano',
        descripcion: 'Recorrido turístico desde Miraflores al Parque Urbano Central',
        origen: {
            lat: -16.4900,
            lng: -68.1400,
            nombre: 'Miraflores (Hospital)'  // ← Nombre exacto
        },
        destino: {
            lat: -16.5255,
            lng: -68.1185,
            nombre: 'Zona Sur (Parque Urbano)'  // ← Nombre exacto
        },
        ruta_minibus: 'ruta_33',
        modo: 'TURISTA',
    },
    'teleferico_morado': {
        id: 'teleferico_morado',
        nombre: '🚠 Teleférico Morado - El Alto → Centro',
        descripcion: 'Viaje en Teleférico Línea Morada desde El Alto hasta el Centro paceño',
        origen: {
            lat: -16.5180,
            lng: -68.1650,
            nombre: 'Estación 6 de Marzo (El Alto)'
        },
        destino: {
            lat: -16.4980,
            lng: -68.1380,
            nombre: 'Estación Calle Murillo (Centro)'
        },
        ruta_minibus: 'ruta_22', // Conexión con minibús
        modo: 'TELEFERICO_MORADO',
        teleferico: 'linea_morada',
        tipo: 'TELEFERICO',
    },

    // ============================================
    // NUEVO CASO 5: TELÉFERICO AMARILLO - Ciudad Satélite → Curva de Olguin
    // ============================================
    'teleferico_amarillo': {
        id: 'teleferico_amarillo',
        nombre: '🚠 Teleférico Amarillo - Ciudad Satélite → Curva de Olguin',
        descripcion: 'Viaje en Teleférico Línea Amarilla desde Ciudad Satélite hasta la Curva de Olguin',
        origen: {
            lat: -16.5300,
            lng: -68.1800,
            nombre: 'Estación Ciudad Satélite'
        },
        destino: {
            lat: -16.5080,
            lng: -68.1500,
            nombre: 'Estación Curva de Olguin'
        },
        ruta_minibus: 'ruta_33', // Conexión con minibús
        modo: 'TELEFERICO_AMARILLO',
        teleferico: 'linea_amarilla',
        tipo: 'TELEFERICO',
    },

    // ============================================
    // NUEVO CASO 6: COMBINADO - Teleférico + Minibús
    // ============================================
    // ============================================
    // CASO COMBINADO - Teleférico Amarillo + Minibús
    // ============================================
    'combinado_teleferico_minibus': {
        id: 'combinado_teleferico_minibus',
        nombre: '🔄 Combinado - Teleférico Amarillo + Minibús',
        descripcion: 'Viaje combinado: Teleférico Amarillo desde Ciudad Satélite, luego minibús al centro',
        origen: {
            lat: -16.5300,
            lng: -68.1800,
            nombre: 'Estación Ciudad Satélite'
        },
        destino: {
            lat: -16.4971,
            lng: -68.1367,
            nombre: 'Estación Central (Centro)'
        },
        ruta_minibus: 'ruta_22',
        teleferico: 'linea_amarilla',
        modo: 'COMBINADO',
        tipo: 'COMBINADO',
    },

    // ============================================
    // NUEVO: SOLO TELEFÉRICO MORADO
    // ============================================
    'teleferico_morado': {
        id: 'teleferico_morado',
        nombre: '🚠 Teleférico Morado - El Alto → Centro',
        descripcion: 'Viaje en Teleférico Línea Morada desde El Alto hasta el Centro paceño',
        origen: {
            lat: -16.5180,
            lng: -68.1650,
            nombre: 'Estación 6 de Marzo (El Alto)'
        },
        destino: {
            lat: -16.4980,
            lng: -68.1380,
            nombre: 'Estación Calle Murillo (Centro)'
        },
        ruta_minibus: null,
        teleferico: 'linea_morada',
        modo: 'TELEFERICO_MORADO',
        tipo: 'TELEFERICO',
    },

    // ============================================
    // NUEVO: SOLO TELEFÉRICO AMARILLO
    // ============================================
    'teleferico_amarillo': {
        id: 'teleferico_amarillo',
        nombre: '🚠 Teleférico Amarillo - Ciudad Satélite → Curva de Olguin',
        descripcion: 'Viaje en Teleférico Línea Amarilla desde Ciudad Satélite hasta la Curva de Olguin',
        origen: {
            lat: -16.5300,
            lng: -68.1800,
            nombre: 'Estación Ciudad Satélite'
        },
        destino: {
            lat: -16.5080,
            lng: -68.1500,
            nombre: 'Estación Curva de Olguin'
        },
        ruta_minibus: null,
        teleferico: 'linea_amarilla',
        modo: 'TELEFERICO_AMARILLO',
        tipo: 'TELEFERICO',
    },
    // ============================================
    // CASO 7: COMPLEJO - Teleférico + Minibús + PumaKatari
    // ============================================
    'complejo_teleferico_minibus_puma': {
        id: 'complejo_teleferico_minibus_puma',
        nombre: '🌀 Complejo - Teleférico + Minibús + PumaKatari',
        descripcion: 'Viaje completo: Teleférico Amarillo, Minibús Ruta 22, PumaKatari Línea Verde',
        origen: {
            lat: -16.5300,
            lng: -68.1800,
            nombre: 'Estación Ciudad Satélite'
        },
        destino: {
            lat: -16.4880,
            lng: -68.1500,
            nombre: 'Parada El Alto'
        },
        ruta_minibus: 'ruta_22',
        teleferico: 'linea_amarilla',
        pumakatari: 'pumakatari_verde',
        modo: 'COMPLEJO',
        tipo: 'COMPLEJO',
    },
};