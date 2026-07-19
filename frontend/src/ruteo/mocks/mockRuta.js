import { COLORS } from '../../constants/colors';

// Ruta simulada: Plaza Murillo → Zona Sur (viaje multimodal)
export const MOCK_RUTA_MULTIMODAL = {
    id: 'ruta-001',
    origen: {
        latitude: -16.4958,
        longitude: -68.1333,
        nombre: 'Plaza Murillo',
        direccion: 'Centro Histórico',
    },
    destino: {
        latitude: -16.5255,
        longitude: -68.1185,
        nombre: 'Zona Sur',
        direccion: 'Calle 21, Obrajes',
    },
    resumen: {
        duracion_total: 32, // minutos
        distancia_total: 4.8, // kilómetros
        transbordos: 2,
        costo_estimado: 7.50, // bolivianos
    },
    tramos: [
        {
            id: 'tramo_1',
            tipo: 'WALK',
            nombre_linea: 'Caminata',
            instrucciones: 'Camina 5 minutos hasta la Estación Central del Teleférico',
            color: COLORS.WALK,
            duracion: 5,
            distancia: 0.3,
            coordenadas: [
                { latitude: -16.4958, longitude: -68.1333 }, // Plaza Murillo
                { latitude: -16.4971, longitude: -68.1367 }, // Estación Central
            ],
        },
        {
            id: 'tramo_2',
            tipo: 'TELEFERICO',
            nombre_linea: 'Teleférico Línea Roja',
            instrucciones: 'Aborda en Estación Central hasta Estación Obrajes',
            color: COLORS.TELEFERICO,
            duracion: 15,
            distancia: 3.2,
            coordenadas: [
                { latitude: -16.4971, longitude: -68.1367 }, // Estación Central
                { latitude: -16.5020, longitude: -68.1300 },
                { latitude: -16.5080, longitude: -68.1250 },
                { latitude: -16.5140, longitude: -68.1220 },
                { latitude: -16.5200, longitude: -68.1200 }, // Estación Obrajes
            ],
        },
        {
            id: 'tramo_3',
            tipo: 'MINIBUS',
            nombre_linea: 'Minibús Ruta 44',
            instrucciones: 'Toma el minibús en la rotonda de Obrajes hacia la Zona Sur',
            color: COLORS.MINIBUS,
            duracion: 12,
            distancia: 1.3,
            coordenadas: [
                { latitude: -16.5200, longitude: -68.1200 }, // Estación Obrajes
                { latitude: -16.5225, longitude: -68.1190 },
                { latitude: -16.5250, longitude: -68.1188 },
                { latitude: -16.5255, longitude: -68.1185 }, // Destino
            ],
        },
    ],
};

// Múltiples rutas de ejemplo para pruebas
export const MOCK_RUTAS = {
    'ruta-centro-sur': MOCK_RUTA_MULTIMODAL,
    'ruta-sur-centro': {
        ...MOCK_RUTA_MULTIMODAL,
        id: 'ruta-002',
        origen: MOCK_RUTA_MULTIMODAL.destino,
        destino: MOCK_RUTA_MULTIMODAL.origen,
        tramos: [...MOCK_RUTA_MULTIMODAL.tramos].reverse().map(tramo => ({
            ...tramo,
            coordenadas: [...tramo.coordenadas].reverse(),
        })),
    },
};