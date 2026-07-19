import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView, Platform,
    StatusBar,
} from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useWalkingRoute, useDrivingRoute } from '../hooks/useOSRM';
import { SearchBar } from '../components/SearchBar';
import { TestCaseSelector } from '../components/TestCaseSelector';
import { getMinibusSegment, TEST_CASES, findRoutesBetween } from '../../services/minibusRoutes';
import { COLORS } from '../../constants/colors';
import { getTelefericoSegment } from '../../services/telefericoRoutes';
import { TELEFERICO_ROUTES } from '../../services/telefericoRoutes';
import { getCombinedRoute } from '../../services/multimodalService';
import { getPumakatariSegment } from '../../services/pumakatariRoutes';
import { useBlockSimulation } from '../hooks/useBlockSimulation';
import { routeRecalculator } from '../../services/routeRecalculator';
import { useTripSimulation } from '../hooks/useTripSimulation';
import { TransportMarker } from '../components/TransportMarker';

const { height, width } = Dimensions.get('window');

// Puntos de referencia en La Paz
const WAYPOINTS = [
    { latitude: -16.5200, longitude: -68.1200, nombre: 'Rotonda Obrajes' },
    { latitude: -16.5050, longitude: -68.1450, nombre: 'Puente Trillizos' },
    { latitude: -16.5080, longitude: -68.1250, nombre: 'Calle 16' },
];
// ============================================
// FUNCIÓN PARA CREAR UNA LÍNEA CONTINUA CON SEGMENTOS DE COLOR
// ============================================
const createContinuousRoute = (tramos) => {
    if (!tramos || tramos.length === 0) return [];


    const segments = [];
    let allCoordinates = [];
    let currentColor = null;
    let currentSegment = [];

    tramos.forEach((tramo, index) => {
        if (!tramo.coordenadas || tramo.coordenadas.length === 0) return;

        // Determinar si es caminata (para línea punteada)
        const isWalk = tramo.tipo === 'WALK' || tramo.esTransbordo;
        const color = tramo.color || COLORS.PRIMARY;
        const isPunteada = isWalk || tramo.esConexion;

        // Si es el primer tramo o cambia el color, crear nuevo segmento
        if (index === 0 || color !== currentColor || isPunteada !== currentSegment.isPunteada) {
            // Guardar segmento anterior si existe
            if (currentSegment.length > 0) {
                segments.push({
                    coordinates: [...currentSegment],
                    color: currentColor,
                    isPunteada: currentSegment.isPunteada,
                });
            }
            // Iniciar nuevo segmento
            currentColor = color;
            currentSegment = [];
            currentSegment.isPunteada = isPunteada;
        }

        // Agregar coordenadas del tramo actual (evitar duplicar el primer punto)
        const coordsToAdd = index === 0
            ? tramo.coordenadas
            : tramo.coordenadas.slice(1);

        currentSegment.push(...coordsToAdd);
        allCoordinates = [...allCoordinates, ...coordsToAdd];
    });

    // Guardar último segmento
    if (currentSegment.length > 0) {
        segments.push({
            coordinates: [...currentSegment],
            color: currentColor,
            isPunteada: currentSegment.isPunteada,
        });
    }

    return { segments, allCoordinates };
};

export default function RoutePlannerScreen() {
    const mapRef = useRef(null);
    const [origin, setOrigin] = useState({
        latitude: -16.4958,
        longitude: -68.1333,
        nombre: 'Plaza Murillo',
    });
    const [destination, setDestination] = useState({
        latitude: -16.5255,
        longitude: -68.1185,
        nombre: 'Zona Sur',
    });
    const [route, setRoute] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [selectedRouteId, setSelectedRouteId] = useState('ruta_44');
    const [showRoutes, setShowRoutes] = useState(false);
    const [showTripControls, setShowTripControls] = useState(false);

    // Estados para los segmentos
    const [walkRoute1, setWalkRoute1] = useState(null);
    const [drivingRoute, setDrivingRoute] = useState(null);
    const [walkRoute2, setWalkRoute2] = useState(null);
    const [loadingWalk1, setLoadingWalk1] = useState(false);
    const [loadingDriving, setLoadingDriving] = useState(false);
    const [loadingWalk2, setLoadingWalk2] = useState(false);
    const [progress1, setProgress1] = useState(0);
    const [progress2, setProgress2] = useState(0);
    const [progress3, setProgress3] = useState(0);

    // ============================================
    // FUNCIÓN PARA MANEJAR LA LLEGADA AL DESTINO
    // ============================================
    // ============================================
    // FUNCIÓN PARA MANEJAR LA LLEGADA AL DESTINO
    // ============================================
    const handleArrival = useCallback((data) => {
        console.log('🎯 ¡Llegaste a tu destino! 🎉');
        console.log(`   📍 ${data.destination}`);
        console.log(`   ⏱️ Tiempo total: ${data.elapsedTime} segundos`);
        console.log(`   🚌 Transporte: ${data.transport}`);

        // ✅ CORREGIDO: Usar template literals correctamente
        const message = `📍 ${data.destination}\n⏱️ Tiempo total: ${data.elapsedTime} segundos\n🚌 Transporte: ${data.transport}`;

        Alert.alert(
            '🎉 ¡Llegaste a tu destino!',
            message, // ✅ Ahora es un string simple, no un array
            [{
                text: '✅ Finalizar viaje',
                onPress: () => {
                    stopTrip();
                    setShowTripControls(false);
                }
            }]
        );
    }, [stopTrip]);

    // ============================================
    // USAR EL HOOK DE SIMULACIÓN DE VIAJE CON CALLBACK
    // ============================================
    const {
        isActive: isTripActive,
        isComplete: isTripComplete,
        currentPosition,
        progress: tripProgress,
        currentTransport,
        currentInstruction,
        elapsedTime,
        startSimulation: startTrip,
        pauseSimulation: pauseTrip,
        resumeSimulation: resumeTrip,
        stopSimulation: stopTrip,
    } = useTripSimulation(route, 1.2, handleArrival); // ← PASAR EL CALLBACK


    // Función para manejar el inicio del viaje
    const handleStartTrip = () => {
        if (!route) {
            Alert.alert('Error', 'Primero calcula una ruta');
            return;
        }
        console.log('🚀 Iniciando viaje...');
        startTrip();
    };

    // ============================================
    // FUNCIÓN DE RECÁLCULO DE RUTA (MOVER DENTRO DEL COMPONENTE)
    // ============================================
    const handleRecalculate = useCallback((blockPoint) => {
        console.log(`🔄 Recalculando ruta evitando bloqueo en: ${blockPoint.nombre}`);

        if (!route) {
            console.warn('⚠️ No hay ruta para recalcular');
            return null;
        }

        try {
            // Usar el servicio de recálculo
            const newRoute = routeRecalculator.recalculateRoute(
                route,
                blockPoint,
                selectedRouteId,
                'pumakatari_verde'
            );

            if (newRoute) {
                console.log('✅ Ruta recalculada correctamente');
                return newRoute;
            } else {
                console.warn('⚠️ El recálculo no devolvió una ruta válida');
                return null;
            }
        } catch (error) {
            console.error('❌ Error en recálculo:', error);
            return null;
        }
    }, [route, selectedRouteId]);

    // ============================================
    // USAR EL HOOK DE SIMULACIÓN
    // ============================================
    const {
        isBlocked,
        blockLocation,
        isRecalculating,
        blockedRoute,
        showBlockOptions,
        setShowBlockOptions,
        startBlockSimulation,
        stopBlockSimulation,
        BLOCK_POINTS,
    } = useBlockSimulation(route, handleRecalculate);

    // Efecto para actualizar la ruta cuando se recalcula
    useEffect(() => {
        if (blockedRoute) {
            console.log('🔄 Actualizando ruta con la recalculada');
            setRoute(blockedRoute);
        }
    }, [blockedRoute]);


    // ============================================
    // SELECCIÓN DE CASO DE PRUEBA
    // ============================================
    const handleTestCaseSelect = (testCase) => {
        if (!testCase) {
            setSelectedTestCase(null);
            setRoute(null);
            return;
        }

        setSelectedTestCase(testCase);
        setSelectedRouteId(testCase.ruta_minibus);

        // Actualizar origen y destino
        setOrigin({
            latitude: testCase.origen.lat,
            longitude: testCase.origen.lng,
            nombre: testCase.origen.nombre,
        });
        setDestination({
            latitude: testCase.destino.lat,
            longitude: testCase.destino.lng,
            nombre: testCase.destino.nombre,
        });

        // Obtener waypoints específicos del caso
        const waypoints = WAYPOINTS[testCase.modo.toLowerCase()] || WAYPOINTS.estudiante;

        // Calcular ruta automáticamente
        setTimeout(() => {
            calculateMultimodalRoute(waypoints);
        }, 300);
    };
    // ============================================
    // CALCULAR RUTA COMPLEJA - SIN CAMINATAS EXTRAS
    // ============================================
    const calculateComplexRoute = async (telefericoId, minibusId, pumakatariId) => {
        console.log(`🌀 Calculando ruta compleja`);

        // Obtener segmentos
        const telefericoSegment = getTelefericoSegment(
            telefericoId,
            { nombre: origin.nombre, lat: origin.latitude, lng: origin.longitude },
            { nombre: destination.nombre, lat: destination.latitude, lng: destination.longitude },
            'forward'
        );

        // Para el minibús, usamos un punto intermedio (donde termina el teleférico)
        const midPoint1 = telefericoSegment?.coordinates[telefericoSegment.coordinates.length - 1] || origin;

        const minibusSegment = getMinibusSegment(
            minibusId,
            { nombre: midPoint1.nombre || 'Estación Curva de Olguin', lat: midPoint1.latitude, lng: midPoint1.longitude },
            { nombre: destination.nombre, lat: destination.latitude, lng: destination.longitude },
            'forward'
        );

        // Para PumaKatari, usamos un punto intermedio (donde termina el minibús)
        const midPoint2 = minibusSegment?.coordinates[minibusSegment.coordinates.length - 1] || destination;

        const pumakatariSegment = getPumakatariSegment(
            pumakatariId,
            { nombre: midPoint2.nombre || 'Parada Av. Ballivián', lat: midPoint2.latitude, lng: midPoint2.longitude },
            { nombre: destination.nombre, lat: destination.latitude, lng: destination.longitude },
            'forward'
        );

        // Verificar disponibilidad
        const hasTeleferico = telefericoSegment !== null;
        const hasMinibus = minibusSegment !== null;
        const hasPumakatari = pumakatariSegment !== null;

        console.log(`   Teleférico: ${hasTeleferico ? '✅' : '❌'}`);
        console.log(`   Minibús: ${hasMinibus ? '✅' : '❌'}`);
        console.log(`   PumaKatari: ${hasPumakatari ? '✅' : '❌'}`);

        // ============================================
        // CONSTRUIR RUTA - SIN CAMINATAS EXTRAS
        // ============================================
        const tramos = [];

        // ✅ 1. Teleférico (DIRECTO, sin caminata previa)
        tramos.push({
            id: 'teleferico',
            tipo: 'TELEFERICO',
            nombre: telefericoSegment.nombre,
            color: telefericoSegment.color || '#F1C40F',
            duracion: Math.round(telefericoSegment.duration || 8),
            distancia: parseFloat((telefericoSegment.distance || 1.6).toFixed(2)),
            coordenadas: telefericoSegment.coordinates,
            instrucciones: `Aborda el ${telefericoSegment.nombre} desde ${origin.nombre}`,
            costo: telefericoSegment.costo || 3.00,
            paradas: telefericoSegment.paradas || [],
            orden: 1,
        });

        // ✅ 2. Conexión Teleférico → Minibús (solo si es necesario)
        const lastTelePoint = telefericoSegment.coordinates[telefericoSegment.coordinates.length - 1];
        const firstMinibusPoint = minibusSegment.coordinates[0];

        // Verificar si realmente hay distancia entre el teleférico y el minibús
        const distanceTeleMinibus = Math.sqrt(
            Math.pow(lastTelePoint.latitude - firstMinibusPoint.latitude, 2) +
            Math.pow(lastTelePoint.longitude - firstMinibusPoint.longitude, 2)
        );

        // Solo agregar caminata de transbordo si hay distancia significativa (> 0.0005)
        if (distanceTeleMinibus > 0.0005) {
            const transferWalk1 = generateWalkRoute(
                lastTelePoint,
                firstMinibusPoint,
                4
            );
            tramos.push({
                id: 'walk_transfer_1',
                tipo: 'WALK',
                nombre: '🔄 Transbordo a Minibús',
                color: COLORS.WARNING,
                duracion: 2,
                distancia: 0.1,
                coordenadas: transferWalk1,
                instrucciones: `Camina al transbordo del teleférico al minibús`,
                esTransbordo: true,
                orden: 2,
            });
        }

        // ✅ 3. Minibús
        tramos.push({
            id: 'minibus',
            tipo: 'MINIBUS',
            nombre: minibusSegment.nombre,
            color: minibusSegment.color || '#007AFF',
            duracion: Math.round(minibusSegment.duration || 8),
            distancia: parseFloat((minibusSegment.distance || 1.6).toFixed(2)),
            coordenadas: minibusSegment.coordinates,
            instrucciones: `Toma el ${minibusSegment.nombre}`,
            costo: minibusSegment.costo || 2.50,
            paradas: minibusSegment.paradas || [],
            orden: 3,
        });

        // ✅ 4. Conexión Minibús → PumaKatari (solo si es necesario)
        const lastMinibusPoint = minibusSegment.coordinates[minibusSegment.coordinates.length - 1];
        const firstPumakatariPoint = pumakatariSegment.coordinates[0];

        const distanceMinibusPuma = Math.sqrt(
            Math.pow(lastMinibusPoint.latitude - firstPumakatariPoint.latitude, 2) +
            Math.pow(lastMinibusPoint.longitude - firstPumakatariPoint.longitude, 2)
        );

        // Solo agregar caminata de transbordo si hay distancia significativa (> 0.0005)
        if (distanceMinibusPuma > 0.0005) {
            const transferWalk2 = generateWalkRoute(
                lastMinibusPoint,
                firstPumakatariPoint,
                4
            );
            tramos.push({
                id: 'walk_transfer_2',
                tipo: 'WALK',
                nombre: '🔄 Transbordo a PumaKatari',
                color: COLORS.WARNING,
                duracion: 2,
                distancia: 0.1,
                coordenadas: transferWalk2,
                instrucciones: `Camina al transbordo del minibús al PumaKatari`,
                esTransbordo: true,
                orden: 4,
            });
        }

        // ✅ 5. PumaKatari (DIRECTO al destino)
        tramos.push({
            id: 'pumakatari',
            tipo: 'PUMAKATARI',
            nombre: pumakatariSegment.nombre,
            color: pumakatariSegment.color || '#34C759',
            duracion: Math.round(pumakatariSegment.duration || 8),
            distancia: parseFloat((pumakatariSegment.distance || 1.6).toFixed(2)),
            coordenadas: pumakatariSegment.coordinates,
            instrucciones: `Aborda el ${pumakatariSegment.nombre} hasta ${destination.nombre}`,
            costo: pumakatariSegment.costo || 2.00,
            paradas: pumakatariSegment.paradas || [],
            orden: 5,
        });

        // ✅ 6. NO hay caminata final - el PumaKatari llega directamente al destino

        // Calcular totales
        let totalDuration = 0;
        let totalDistance = 0;
        let totalCosto = 0;
        tramos.forEach(t => {
            totalDuration += t.duracion || 0;
            totalDistance += t.distancia || 0;
            if (t.costo) totalCosto += t.costo;
        });

        const routeData = {
            id: `complex_${Date.now()}`,
            origen: origin,
            destino: destination,
            tramos: tramos,
            resumen: {
                duracion_total: Math.round(totalDuration),
                distancia_total: parseFloat(totalDistance.toFixed(2)),
                transbordos: 2,
                costo_estimado: parseFloat(totalCosto.toFixed(2)),
            },
        };

        console.log('✅ Ruta compleja creada sin caminatas extras:');
        console.log(`   Tramo 1: ${tramos[0].tipo} (${tramos[0].coordenadas.length} pts)`);
        if (tramos.length > 3) {
            console.log(`   Tramo 2: ${tramos[1].tipo} (${tramos[1].coordenadas.length} pts)`);
            console.log(`   Tramo 3: ${tramos[2].tipo} (${tramos[2].coordenadas.length} pts)`);
        }

        setRoute(routeData);
        setIsCalculating(false);
        setTimeout(() => fitMapToRoute(routeData), 500);
    };

    // ============================================
    // CÁLCULO DE RUTA MULTIMODAL (VERSIÓN CORREGIDA)
    // ============================================
    const calculateMultimodalRoute = async () => {
        setIsCalculating(true);
        setRoute(null);

        try {
            // 🔍 DETECTAR TIPO DE CASO
            const caseType = selectedTestCase?.tipo || 'MINIBUS';
            const telefericoId = selectedTestCase?.teleferico || null;
            const minibusId = selectedTestCase?.ruta_minibus || null;
            const pumakatariId = selectedTestCase?.pumakatari || null;

            console.log(`📋 Tipo de caso: ${caseType}`);
            console.log(`   Teleférico: ${telefericoId}`);
            console.log(`   Minibús: ${minibusId}`);
            console.log(`   PumaKatari: ${pumakatariId}`);

            // CASO COMPLEJO (Teleférico + Minibús + PumaKatari)
            if (caseType === 'COMPLEJO' && telefericoId && minibusId && pumakatariId) {
                console.log(`🌀 Calculando ruta compleja: ${telefericoId} + ${minibusId} + ${pumakatariId}`);
                await calculateComplexRoute(telefericoId, minibusId, pumakatariId);
                return;
            }

            // ============================================
            // CASO 1: SOLO TELEFÉRICO
            // ============================================
            if (caseType === 'TELEFERICO' && telefericoId) {
                console.log(`🚠 Calculando SOLO teleférico: ${telefericoId}`);
                await calculateTelefericoOnly(telefericoId);
                return;
            }

            // ============================================
            // CASO 2: COMBINADO (Teleférico + Minibús)
            // ============================================
            if (caseType === 'COMBINADO' && telefericoId && minibusId) {
                console.log(`🔄 Calculando COMBINADO: ${telefericoId} + ${minibusId}`);
                await calculateCombinedRoute(telefericoId, minibusId);
                return;
            }

            // ============================================
            // CASO 3: SOLO MINIBÚS (default)
            // ============================================
            console.log(`🚐 Calculando SOLO minibús: ${minibusId || 'ruta_44'}`);
            await calculateMinibusOnly(minibusId || 'ruta_44');

        } catch (error) {
            console.error('❌ Error calculando ruta:', error);
            Alert.alert('Error', 'No se pudo calcular la ruta');
            setIsCalculating(false);
        }
    };

    // ============================================
    // CALCULAR SOLO TELEFÉRICO
    // ============================================
    const calculateTelefericoOnly = async (telefericoId) => {
        console.log(`🚠 Calculando teleférico: ${telefericoId}`);

        const telefericoSegment = getTelefericoSegment(
            telefericoId,
            { nombre: origin.nombre, lat: origin.latitude, lng: origin.longitude },
            { nombre: destination.nombre, lat: destination.latitude, lng: destination.longitude },
            'forward'
        );

        if (!telefericoSegment) {
            console.warn('⚠️ No se encontró teleférico');
            Alert.alert('Error', 'No se encontró ruta de teleférico');
            setIsCalculating(false);
            return;
        }

        console.log(`✅ Teleférico encontrado: ${telefericoSegment.nombre}`);

        // Simular carga
        setLoadingWalk1(true);
        setProgress1(50);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Caminata inicial
        const walkCoords1 = generateWalkRoute(
            { latitude: origin.latitude, longitude: origin.longitude },
            {
                latitude: telefericoSegment.coordinates[0].latitude,
                longitude: telefericoSegment.coordinates[0].longitude
            }
        );

        setLoadingWalk1(false);
        setProgress1(100);

        // Cargar teleférico
        setLoadingDriving(true);
        setProgress2(50);
        await new Promise(resolve => setTimeout(resolve, 800));

        setDrivingRoute({
            coordinates: telefericoSegment.coordinates,
            duration: telefericoSegment.duration,
            distance: telefericoSegment.distance,
            nombre: telefericoSegment.nombre,
            color: telefericoSegment.color,
            costo: telefericoSegment.costo,
            paradas: telefericoSegment.paradas,
            tipo: 'TELEFERICO',
        });
        setLoadingDriving(false);
        setProgress2(100);

        // Caminata final
        setLoadingWalk2(true);
        setProgress3(50);
        await new Promise(resolve => setTimeout(resolve, 500));

        const lastCoord = telefericoSegment.coordinates[telefericoSegment.coordinates.length - 1];
        const walkCoords2 = generateWalkRoute(
            { latitude: lastCoord.latitude, longitude: lastCoord.longitude },
            { latitude: destination.latitude, longitude: destination.longitude }
        );
        setLoadingWalk2(false);
        setProgress3(100);

        // Construir ruta
        setTimeout(() => {
            const routeData = {
                id: `teleferico_${Date.now()}`,
                origen: origin,
                destino: destination,
                tramos: [
                    {
                        id: 'walk_1',
                        tipo: 'WALK',
                        nombre: 'Caminata a la estación',
                        color: COLORS.WALK,
                        duracion: 5,
                        distancia: 0.3,
                        coordenadas: walkCoords1,
                        instrucciones: `Camina desde ${origin.nombre} hasta la estación de teleférico`,
                    },
                    {
                        id: 'teleferico_1',
                        tipo: 'TELEFERICO',
                        nombre: telefericoSegment.nombre,
                        color: telefericoSegment.color,
                        duracion: Math.round(telefericoSegment.duration),
                        distancia: parseFloat(telefericoSegment.distance.toFixed(2)),
                        coordenadas: telefericoSegment.coordinates,
                        instrucciones: `Aborda el teleférico hacia ${destination.nombre}`,
                        costo: telefericoSegment.costo,
                        paradas: telefericoSegment.paradas,
                    },
                    {
                        id: 'walk_2',
                        tipo: 'WALK',
                        nombre: 'Caminata al destino',
                        color: COLORS.WALK,
                        duracion: 3,
                        distancia: 0.2,
                        coordenadas: walkCoords2,
                        instrucciones: `Camina hasta ${destination.nombre}`,
                    },
                ],
                resumen: {
                    duracion_total: Math.round(telefericoSegment.duration + 8),
                    distancia_total: parseFloat((telefericoSegment.distance + 0.5).toFixed(2)),
                    transbordos: 0,
                    costo_estimado: telefericoSegment.costo || 3.00,
                },
            };
            setRoute(routeData);
            setIsCalculating(false);
            setTimeout(() => fitMapToRoute(routeData), 300);
        }, 300);
    };

    // ============================================
    // CALCULAR SOLO MINIBÚS
    // ============================================
    const calculateMinibusOnly = async (routeId) => {
        console.log(`🚐 Calculando minibús: ${routeId}`);

        const minibusSegment = getMinibusSegment(
            routeId,
            { nombre: origin.nombre, lat: origin.latitude, lng: origin.longitude },
            { nombre: destination.nombre, lat: destination.latitude, lng: destination.longitude },
            'forward'
        );

        if (!minibusSegment) {
            console.warn('⚠️ No se encontró minibús');
            // Fallback a caminata
            const walkCoords = generateWalkRoute(
                { latitude: origin.latitude, longitude: origin.longitude },
                { latitude: destination.latitude, longitude: destination.longitude },
                15
            );
            const fallbackRoute = {
                id: `fallback_${Date.now()}`,
                origen: origin,
                destino: destination,
                tramos: [{
                    id: 'walk_fallback',
                    tipo: 'WALK',
                    nombre: 'Caminata directa',
                    color: COLORS.WALK,
                    duracion: 25,
                    distancia: 2.5,
                    coordenadas: walkCoords,
                    instrucciones: `Camina desde ${origin.nombre} hasta ${destination.nombre}`,
                    esFallback: true,
                }],
                resumen: {
                    duracion_total: 25,
                    distancia_total: 2.5,
                    transbordos: 0,
                    costo_estimado: 0,
                },
            };
            setRoute(fallbackRoute);
            setIsCalculating(false);
            setTimeout(() => fitMapToRoute(fallbackRoute), 300);
            return;
        }

        console.log(`✅ Minibús encontrado: ${minibusSegment.nombre}`);
        console.log(`   Paradas: ${minibusSegment.paradas.join(' → ')}`);

        // Simular carga
        setLoadingWalk1(true);
        setProgress1(30);
        await new Promise(resolve => setTimeout(resolve, 400));

        const walkCoords1 = generateWalkRoute(
            { latitude: origin.latitude, longitude: origin.longitude },
            { latitude: minibusSegment.coordinates[0].latitude, longitude: minibusSegment.coordinates[0].longitude }
        );
        setLoadingWalk1(false);
        setProgress1(100);

        setLoadingDriving(true);
        setProgress2(30);
        await new Promise(resolve => setTimeout(resolve, 600));
        setLoadingDriving(false);
        setProgress2(100);

        setLoadingWalk2(true);
        setProgress3(30);
        await new Promise(resolve => setTimeout(resolve, 400));

        const lastCoord = minibusSegment.coordinates[minibusSegment.coordinates.length - 1];
        const walkCoords2 = generateWalkRoute(
            { latitude: lastCoord.latitude, longitude: lastCoord.longitude },
            { latitude: destination.latitude, longitude: destination.longitude }
        );
        setLoadingWalk2(false);
        setProgress3(100);

        setTimeout(() => {
            const routeData = {
                id: `minibus_${Date.now()}`,
                origen: origin,
                destino: destination,
                tramos: [
                    {
                        id: 'walk_1',
                        tipo: 'WALK',
                        nombre: 'Caminata inicial',
                        color: COLORS.WALK,
                        duracion: 5,
                        distancia: 0.3,
                        coordenadas: walkCoords1,
                        instrucciones: `Camina desde ${origin.nombre} hasta la parada de minibús`,
                    },
                    {
                        id: 'minibus_1',
                        tipo: 'MINIBUS',
                        nombre: minibusSegment.nombre,
                        color: minibusSegment.color,
                        duracion: Math.round(minibusSegment.duration),
                        distancia: parseFloat(minibusSegment.distance.toFixed(2)),
                        coordenadas: minibusSegment.coordinates,
                        instrucciones: `Toma el minibús hacia ${destination.nombre}`,
                        costo: minibusSegment.costo,
                        paradas: minibusSegment.paradas,
                    },
                    {
                        id: 'walk_2',
                        tipo: 'WALK',
                        nombre: 'Caminata al destino',
                        color: COLORS.WALK,
                        duracion: 3,
                        distancia: 0.2,
                        coordenadas: walkCoords2,
                        instrucciones: `Camina hasta ${destination.nombre}`,
                    },
                ],
                resumen: {
                    duracion_total: Math.round(minibusSegment.duration + 8),
                    distancia_total: parseFloat((minibusSegment.distance + 0.5).toFixed(2)),
                    transbordos: 0,
                    costo_estimado: minibusSegment.costo || 2.50,
                },
            };
            setRoute(routeData);
            setIsCalculating(false);
            setTimeout(() => fitMapToRoute(routeData), 300);
        }, 300);
    };
    // ============================================
// CALCULAR COMBINADO - SIN CAMINATAS EXTRAS
// ============================================
const calculateCombinedRoute = async (telefericoId, minibusId) => {
    console.log(`🔄 Calculando combinado: ${telefericoId} + ${minibusId}`);

    const telefericoSegment = getTelefericoSegment(
        telefericoId,
        { nombre: origin.nombre, lat: origin.latitude, lng: origin.longitude },
        { nombre: destination.nombre, lat: destination.latitude, lng: destination.longitude },
        'forward'
    );

    const minibusSegment = getMinibusSegment(
        minibusId,
        { nombre: origin.nombre, lat: origin.latitude, lng: origin.longitude },
        { nombre: destination.nombre, lat: destination.latitude, lng: destination.longitude },
        'forward'
    );

    const hasTeleferico = telefericoSegment !== null && telefericoSegment.coordinates.length > 1;
    const hasMinibus = minibusSegment !== null && minibusSegment.coordinates.length > 1;

    if (!hasTeleferico && !hasMinibus) {
        await calculateFallbackRoute();
        return;
    }

    const telefericoCoords = telefericoSegment.coordinates;
    const minibusCoords = minibusSegment.coordinates;

    // ✅ UNIR COORDENADAS DIRECTAMENTE sin caminatas extras
    const minibusCoordsWithoutFirst = minibusCoords.slice(1);
    const allCoords = [...telefericoCoords, ...minibusCoordsWithoutFirst];

    // ✅ Construir ruta con solo 2 tramos (teleférico + minibús)
    const tramos = [];

    // 1. Teleférico
    tramos.push({
        id: 'teleferico',
        tipo: 'TELEFERICO',
        nombre: telefericoSegment.nombre,
        color: telefericoSegment.color || '#F1C40F',
        duracion: Math.round(telefericoSegment.duration || 8),
        distancia: parseFloat((telefericoSegment.distance || 1.6).toFixed(2)),
        coordenadas: telefericoCoords,
        instrucciones: `Aborda el ${telefericoSegment.nombre} desde ${origin.nombre}`,
        costo: telefericoSegment.costo || 3.00,
        paradas: telefericoSegment.paradas || [],
        orden: 1,
    });

    // 2. Minibús (directo, sin caminata intermedia)
    tramos.push({
        id: 'minibus',
        tipo: 'MINIBUS',
        nombre: minibusSegment.nombre,
        color: minibusSegment.color || '#007AFF',
        duracion: Math.round(minibusSegment.duration || 8),
        distancia: parseFloat((minibusSegment.distance || 1.6).toFixed(2)),
        coordenadas: minibusCoords,
        instrucciones: `Toma el ${minibusSegment.nombre} hasta ${destination.nombre}`,
        costo: minibusSegment.costo || 2.50,
        paradas: minibusSegment.paradas || [],
        orden: 2,
    });

    // Calcular totales
    let totalDuration = 0;
    let totalDistance = 0;
    let totalCosto = 0;
    tramos.forEach(t => {
        totalDuration += t.duracion || 0;
        totalDistance += t.distancia || 0;
        if (t.costo) totalCosto += t.costo;
    });

    const routeData = {
        id: `combined_${Date.now()}`,
        origen: origin,
        destino: destination,
        tramos: tramos,
        resumen: {
            duracion_total: Math.round(totalDuration),
            distancia_total: parseFloat(totalDistance.toFixed(2)),
            transbordos: 1,
            costo_estimado: parseFloat(totalCosto.toFixed(2)),
        },
    };

    setRoute(routeData);
    setIsCalculating(false);
    setTimeout(() => fitMapToRoute(routeData), 500);
};
    // ============================================
    // FUNCIÓN PARA COMBINAR COORDENADAS PARA EL MAPA
    // ============================================
    const getMapCoordinates = (tramos) => {
        if (!tramos || tramos.length === 0) return [];

        let allCoords = [];
        tramos.forEach((tramo, index) => {
            if (tramo.coordenadas && tramo.coordenadas.length > 0) {
                // Si no es el primer tramo, omitir el primer punto para evitar duplicados
                const coordsToAdd = index === 0
                    ? tramo.coordenadas
                    : tramo.coordenadas.slice(1);
                allCoords = [...allCoords, ...coordsToAdd];
            }
        });
        return allCoords;
    };

    // ============================================
    // FUNCIÓN PARA DIBUJAR UNA LÍNEA CONTINUA
    // ============================================
    const renderContinuousRoute = (routeData) => {
        if (!routeData) return null;

        const allCoordinates = getMapCoordinates(routeData.tramos);
        if (allCoordinates.length < 2) return null;

        // Colores por tipo de tramo
        const getColorForSegment = (tramo) => {
            if (tramo.tipo === 'TELEFERICO') return tramo.color || '#F1C40F';
            if (tramo.tipo === 'MINIBUS') return tramo.color || '#007AFF';
            return tramo.color || COLORS.WALK;
        };

        // Dibujar cada tramo por separado para mantener colores
        return routeData.tramos.map((tramo, index) => {
            if (!tramo.coordenadas || tramo.coordenadas.length < 2) return null;

            // Determinar si es línea punteada (caminata)
            const isWalk = tramo.tipo === 'WALK' || tramo.esTransbordo;

            return (
                <Polyline
                    key={`route-${index}`}
                    coordinates={tramo.coordenadas}
                    strokeWidth={isWalk ? 4 : 6}
                    strokeColor={tramo.color || COLORS.PRIMARY}
                    lineDashPattern={isWalk ? [8, 8] : undefined}
                    lineCap="round"
                    lineJoin="round"
                />
            );
        });
    };

    // ============================================
    // FUNCIÓN AUXILIAR - Dividir ruta en punto (MEJORADA)
    // ============================================
    const splitRouteAtPoint = (coordinates, splitPoint) => {
        if (!coordinates || coordinates.length === 0) {
            console.warn('⚠️ No hay coordenadas para dividir');
            return { coordinates: [], duration: 0, distance: 0 };
        }

        // Si el punto de división es null o undefined, usar el primer punto
        if (!splitPoint) {
            console.warn('⚠️ Punto de división null, usando primer punto');
            return {
                coordinates: coordinates,
                duration: coordinates.length * 2,
                distance: coordinates.length * 0.4
            };
        }

        // Encontrar el índice más cercano al punto de división
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

        console.log(`📍 Split en índice ${splitIndex} de ${coordinates.length} puntos`);

        return {
            coordinates: coordinates.slice(0, splitIndex + 1),
            duration: splitIndex * 2,
            distance: splitIndex * 0.4,
        };
    };

    // ============================================
    // FUNCIÓN DE FALLBACK
    // ============================================
    const calculateFallbackRoute = async () => {
        console.warn('⚠️ Calculando ruta de fallback (caminata)');
        const walkCoords = generateWalkRoute(
            { latitude: origin.latitude, longitude: origin.longitude },
            { latitude: destination.latitude, longitude: destination.longitude },
            15
        );
        const fallbackRoute = {
            id: `fallback_${Date.now()}`,
            origen: origin,
            destino: destination,
            tramos: [{
                id: 'walk_fallback',
                tipo: 'WALK',
                nombre: 'Caminata directa',
                color: COLORS.WALK,
                duracion: 25,
                distancia: 2.5,
                coordenadas: walkCoords,
                instrucciones: `Camina desde ${origin.nombre} hasta ${destination.nombre}`,
                esFallback: true,
            }],
            resumen: {
                duracion_total: 25,
                distancia_total: 2.5,
                transbordos: 0,
                costo_estimado: 0,
            },
        };
        setRoute(fallbackRoute);
        setIsCalculating(false);
        setTimeout(() => fitMapToRoute(fallbackRoute), 300);
    };
    const findTransferPoint = (coords1, coords2) => {
        let minDistance = Infinity;
        let bestPoint = coords2[0] || { latitude: coords1[0].latitude, longitude: coords1[0].longitude };

        for (const p1 of coords1) {
            for (const p2 of coords2) {
                const distance = Math.sqrt(
                    Math.pow(p1.latitude - p2.latitude, 2) +
                    Math.pow(p1.longitude - p2.longitude, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    bestPoint = p2;
                }
            }
        }

        return {
            latitude: bestPoint.latitude,
            longitude: bestPoint.longitude,
            nombre: 'Punto de transbordo',
        };
    };


    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================
    const generateWalkRoute = (from, to, segments = 8) => {
        const coords = [];
        for (let i = 0; i <= segments; i++) {
            const fraction = i / segments;
            // Agregar pequeña curvatura para simular calles
            const offset = Math.sin(fraction * Math.PI) * 0.0003;
            coords.push({
                latitude: from.latitude + (to.latitude - from.latitude) * fraction + offset,
                longitude: from.longitude + (to.longitude - from.longitude) * fraction + offset * 0.5,
            });
        }
        return coords;
    };

    const buildMultimodalRoute = ({ walkToFirst, drivingSegments, walkToDestination, waypoints }) => {
        const tramos = [];
        let totalDuration = 0;
        let totalDistance = 0;

        // 1. Caminata inicial
        if (walkToFirst) {
            tramos.push({
                id: 'walk_1',
                tipo: 'WALK',
                nombre: 'Caminata inicial',
                color: COLORS.WALK,
                duracion: Math.round(walkToFirst.duration || 5),
                distancia: parseFloat((walkToFirst.distance || 0.3).toFixed(2)),
                coordenadas: walkToFirst.coordinates || [],
                instrucciones: `Camina desde ${origin.nombre} hasta la parada de minibús`,
                esFallback: false,
            });
            totalDuration += walkToFirst.duration || 5;
            totalDistance += walkToFirst.distance || 0.3;
        }

        // 2. Minibús
        drivingSegments.forEach((segment, index) => {
            if (segment) {
                tramos.push({
                    id: `driving_${index + 1}`,
                    tipo: 'MINIBUS',
                    nombre: segment.nombre || `Minibús ${selectedRouteId.replace('ruta_', '')}`,
                    color: segment.color || COLORS.MINIBUS,
                    duracion: Math.round(segment.duration || 10),
                    distancia: parseFloat((segment.distance || 1.5).toFixed(2)),
                    coordenadas: segment.coordinates || [],
                    instrucciones: `Toma el minibús hacia ${destination.nombre}`,
                    esFallback: false,
                    paradas: segment.paradas || [],
                    costo: segment.costo || 2.50,
                });
                totalDuration += segment.duration || 10;
                totalDistance += segment.distance || 1.5;
            }
        });

        // 3. Caminata final
        if (walkToDestination) {
            tramos.push({
                id: 'walk_2',
                tipo: 'WALK',
                nombre: 'Caminata al destino',
                color: COLORS.WALK,
                duracion: Math.round(walkToDestination.duration || 3),
                distancia: parseFloat((walkToDestination.distance || 0.2).toFixed(2)),
                coordenadas: walkToDestination.coordinates || [],
                instrucciones: `Camina hasta ${destination.nombre}`,
                esFallback: false,
            });
            totalDuration += walkToDestination.duration || 3;
            totalDistance += walkToDestination.distance || 0.2;
        }

        return {
            id: `multimodal_${Date.now()}`,
            origen: origin,
            destino: destination,
            tramos,
            resumen: {
                duracion_total: Math.round(totalDuration),
                distancia_total: parseFloat(totalDistance.toFixed(2)),
                transbordos: drivingSegments.length,
                costo_estimado: parseFloat((totalDistance * 1.5 + (drivingSegments.length * 2.5)).toFixed(2)),
            },
        };
    };

    const fitMapToRoute = (routeData) => {
        if (!routeData || !mapRef.current) return;

        const allCoordinates = routeData.tramos.flatMap(t => t.coordenadas);
        if (allCoordinates.length > 0) {
            mapRef.current.fitToCoordinates(allCoordinates, {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true,
            });
        }
    };

    // ============================================
    // RENDER
    // ============================================
    const isLoading = loadingWalk1 || loadingDriving || loadingWalk2;
    const progress = (progress1 + progress2 + progress3) / 3;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.container}>
                {/* Mapa */}
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={{
                        latitude: -16.5000,
                        longitude: -68.1250,
                        latitudeDelta: 0.06,
                        longitudeDelta: 0.06,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    {/* Origen */}
                    {origin && (
                        <Marker
                            coordinate={origin}
                            title={origin.nombre}
                            description="Punto de inicio"
                            anchor={{ x: 0.5, y: 0.5 }} // ← Centrar el marcador
                        >
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerPin, styles.markerOrigin]}>
                                    <Text style={styles.markerEmoji}>📍</Text>
                                </View>
                                <View style={styles.markerLabelContainer}>
                                    <Text style={styles.markerLabelText}>Origen</Text>
                                </View>
                            </View>
                        </Marker>
                    )}

                    {/* Destino */}
                    {destination && (
                        <Marker
                            coordinate={destination}
                            title={destination.nombre}
                            description="Punto de destino"
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerPin, styles.markerDestination]}>
                                    <Text style={styles.markerEmoji}>🏁</Text>
                                </View>
                                <View style={styles.markerLabelContainer}>
                                    <Text style={styles.markerLabelText}>Destino</Text>
                                </View>
                            </View>
                        </Marker>
                    )}
                    {/* Waypoints (puntos intermedios) - Versión mejorada */}
                    {WAYPOINTS.map((wp, index) => (
                        <Marker
                            key={index}
                            coordinate={wp}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerPin, styles.markerWaypoint]}>
                                    <Text style={styles.markerEmoji}>🔄</Text>
                                </View>
                                <View style={styles.markerLabelContainer}>
                                    <Text style={styles.markerLabelText}>Transbordo</Text>
                                </View>
                            </View>
                        </Marker>
                    ))}

                    {/* Ruta Multimodal - LÍNEA CONTINUA */}
                    {route && route.continuousRoute && (
                        // Dibujar segmentos continuos con diferentes colores
                        route.continuousRoute.segments.map((segment, index) => (
                            <Polyline
                                key={`segment-${index}`}
                                coordinates={segment.coordinates}
                                strokeWidth={segment.isPunteada ? 4 : 6}
                                strokeColor={segment.color}
                                lineDashPattern={segment.isPunteada ? [8, 8] : undefined}
                                lineCap="round"
                                lineJoin="round"
                                zIndex={segment.isPunteada ? 1 : 2}
                            />
                        ))
                    )}

                    {/* Fallback: Si no hay continuousRoute, usar tramos individuales */}
                    {route && !route.continuousRoute && route.tramos.map((tramo, index) => {
                        if (!tramo.coordenadas || tramo.coordenadas.length < 2) return null;
                        const isWalk = tramo.tipo === 'WALK' || tramo.esTransbordo;
                        return (
                            <Polyline
                                key={tramo.id || `route-${index}`}
                                coordinates={tramo.coordenadas}
                                strokeWidth={isWalk ? 4 : 6}
                                strokeColor={tramo.color || COLORS.PRIMARY}
                                lineDashPattern={isWalk ? [8, 8] : undefined}
                                lineCap="round"
                                lineJoin="round"
                            />
                        );
                    })}
                    {/* Marcador de simulación de viaje */}
                    {isTripActive && currentPosition && (
                        <Marker
                            coordinate={currentPosition}
                            anchor={{ x: 0.5, y: 0.5 }}
                            zIndex={100}
                        >
                            <TransportMarker
                                type={currentTransport || 'WALK'}
                                size={45}
                                pulse={true}
                            />
                        </Marker>
                    )}
                </MapView>

                {/* Controles superiores */}
                <View style={styles.topControls}>
                    <TestCaseSelector
                        onSelect={handleTestCaseSelect}
                        selectedCase={selectedTestCase}
                    />

                    <View style={styles.searchContainer}>
                        <SearchBar
                            placeholder="Origen..."
                            icon="📍"
                            value={origin?.nombre || ''}
                            onPlaceSelect={(place) => {
                                setOrigin({
                                    latitude: place.latitud || place.latitude,
                                    longitude: place.longitud || place.longitude,
                                    nombre: place.nombre,
                                });
                            }}
                        />
                    </View>

                    <View style={styles.searchContainer}>
                        <SearchBar
                            placeholder="Destino..."
                            icon="🏁"
                            value={destination?.nombre || ''}
                            onPlaceSelect={(place) => {
                                setDestination({
                                    latitude: place.latitud || place.latitude,
                                    longitude: place.longitud || place.longitude,
                                    nombre: place.nombre,
                                });
                            }}
                        />
                    </View>
                </View>

                {/* Panel inferior */}
                <View style={styles.bottomPanel}>
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                            <Text style={styles.loadingText}>
                                Calculando ruta... {Math.round(progress)}%
                            </Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progress}%` }]} />
                            </View>
                            <Text style={styles.loadingSubtext}>
                                {loadingWalk1 && '🚶 Calculando caminata...'}
                                {!loadingWalk1 && loadingDriving && '🚐 Buscando minibús...'}
                                {!loadingWalk1 && !loadingDriving && loadingWalk2 && '🚶 Calculando caminata final...'}
                            </Text>
                        </View>
                    )}

                    {route && !isLoading && (
                        <>
                            <View style={styles.routeSummary}>
                                <View style={styles.routeHeader}>
                                    <Text style={styles.routeTitle}>🚐 Ruta Multimodal</Text>
                                    {selectedTestCase && (
                                        <View style={styles.testCaseBadge}>
                                            <Text style={styles.testCaseBadgeText}>
                                                {selectedTestCase.modo}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.routeStats}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statIcon}>🕐</Text>
                                        <Text style={styles.statText}>{route.resumen.duracion_total} min</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statIcon}>📏</Text>
                                        <Text style={styles.statText}>{route.resumen.distancia_total} km</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statIcon}>🔄</Text>
                                        <Text style={styles.statText}>{route.resumen.transbordos} transbordos</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statIcon}>💰</Text>
                                        <Text style={styles.statText}>Bs {route.resumen.costo_estimado}</Text>
                                    </View>
                                </View>
                            </View>

                            <ScrollView
                                style={styles.stepsContainer}
                                showsVerticalScrollIndicator={false}
                            >
                                {route.tramos.map((tramo, index) => {
                                    // Determinar icono según tipo
                                    let icon = '🚶';
                                    let tipoDisplay = 'Caminata';

                                    if (tramo.tipo === 'TELEFERICO') {
                                        icon = '🚠';
                                        tipoDisplay = 'Teleférico';
                                    } else if (tramo.tipo === 'MINIBUS') {
                                        icon = '🚐';
                                        tipoDisplay = 'Minibús';
                                    } else if (tramo.tipo === 'WALK') {
                                        icon = '🚶';
                                        tipoDisplay = 'Caminata';
                                    }

                                    return (
                                        <View key={tramo.id} style={styles.stepItem}>
                                            <View style={styles.stepNumber}>
                                                <Text style={styles.stepNumberText}>{index + 1}</Text>
                                            </View>
                                            <View style={[styles.stepBadge, { backgroundColor: tramo.color }]}>
                                                <Text style={styles.stepBadgeText}>{icon}</Text>
                                            </View>
                                            <View style={styles.stepContent}>
                                                <View style={styles.stepHeader}>
                                                    <Text style={styles.stepTitle}>
                                                        {tramo.nombre}
                                                    </Text>
                                                    <Text style={styles.stepTypeBadge}>
                                                        {tipoDisplay}
                                                    </Text>
                                                </View>
                                                <Text style={styles.stepInstruction} numberOfLines={2}>
                                                    {tramo.instrucciones}
                                                </Text>
                                                <View style={styles.stepMeta}>
                                                    <Text style={styles.stepMetaText}>⏱️ {tramo.duracion} min</Text>
                                                    <Text style={styles.stepMetaText}>📏 {tramo.distancia} km</Text>
                                                    {tramo.costo && (
                                                        <Text style={styles.stepMetaText}>💰 Bs {tramo.costo}</Text>
                                                    )}
                                                </View>
                                                {tramo.paradas && tramo.paradas.length > 0 && (
                                                    <View style={styles.stepParadasContainer}>
                                                        <Text style={styles.stepParadasLabel}>🚏 Paradas:</Text>
                                                        <Text style={styles.stepParadas} numberOfLines={2}>
                                                            {tramo.paradas.join(' → ')}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={() => {
                                    Alert.alert(
                                        '🚀 ¡Viaje iniciado!',
                                        `Siguiendo ruta desde ${origin.nombre} hasta ${destination.nombre}\n\n` +
                                        `Duración estimada: ${route.resumen.duracion_total} minutos\n` +
                                        `Costo estimado: Bs ${route.resumen.costo_estimado}`
                                    );
                                }}
                            >
                                <Text style={styles.startButtonText}>
                                    🚀 Iniciar Recorrido
                                </Text>
                            </TouchableOpacity>
                            {route && !isLoading && (
                                <View style={styles.simulationControls}>
                                    <Text style={styles.simulationTitle}>🚧 Simulación de Bloqueos</Text>
                                    <View style={styles.simulationButtons}>
                                        <TouchableOpacity
                                            style={[styles.simButton, styles.simButtonBlock]}
                                            onPress={() => {
                                                const randomKey = Object.keys(BLOCK_POINTS)[
                                                    Math.floor(Math.random() * Object.keys(BLOCK_POINTS).length)
                                                ];
                                                startBlockSimulation(BLOCK_POINTS[randomKey]);
                                            }}
                                            disabled={isBlocked || isRecalculating}
                                        >
                                            <Text style={styles.simButtonText}>
                                                {isBlocked ? '🚧 Bloqueo Activo' : '🚧 Simular Bloqueo'}
                                            </Text>
                                        </TouchableOpacity>

                                        {isBlocked && (
                                            <TouchableOpacity
                                                style={[styles.simButton, styles.simButtonClear]}
                                                onPress={stopBlockSimulation}
                                            >
                                                <Text style={styles.simButtonText}>✅ Limpiar Bloqueo</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {isRecalculating && (
                                        <View style={styles.recalculatingContainer}>
                                            <ActivityIndicator size="small" color={COLORS.WARNING} />
                                            <Text style={styles.recalculatingText}>🔄 Recalculando ruta...</Text>
                                        </View>
                                    )}

                                    {blockLocation && (
                                        <View style={styles.blockInfo}>
                                            <Text style={styles.blockText}>
                                                ⚠️ Bloqueo en: {blockLocation.nombre}
                                            </Text>
                                            <Text style={styles.blockDesc}>
                                                {blockLocation.descripcion}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            {/* Controles de simulación de viaje */}
                            <View style={styles.tripControls}>
                                <TouchableOpacity
                                    style={[styles.tripButton, styles.tripButtonStart]}
                                    onPress={handleStartTrip}
                                    disabled={isTripActive || isTripComplete || !route}
                                >
                                    <Text style={styles.tripButtonText}>
                                        🚀 {isTripComplete ? 'Viaje Completado' : 'Simular Viaje'}
                                    </Text>
                                </TouchableOpacity>

                                {isTripActive && (
                                    <View style={styles.tripStatus}>
                                        <View style={styles.tripProgress}>
                                            <View style={[styles.tripProgressFill, { width: `${tripProgress}%` }]} />
                                            <Text style={styles.tripProgressText}>
                                                {Math.round(tripProgress)}%
                                            </Text>
                                        </View>
                                        <View style={styles.tripInfo}>
                                            <Text style={styles.tripInfoText}>
                                                🚌 {currentTransport || 'Caminata'}
                                            </Text>
                                            <Text style={styles.tripInfoText}>
                                                ⏱️ {elapsedTime}s
                                            </Text>
                                            <Text style={styles.tripInfoText} numberOfLines={1}>
                                                {currentInstruction || 'En camino...'}
                                            </Text>
                                        </View>
                                        <View style={styles.tripControlsRow}>
                                            <TouchableOpacity
                                                style={[styles.tripControlBtn, styles.tripPauseBtn]}
                                                onPress={pauseTrip}
                                            >
                                                <Text style={styles.tripControlText}>⏸ Pausar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.tripControlBtn, styles.tripResumeBtn]}
                                                onPress={resumeTrip}
                                            >
                                                <Text style={styles.tripControlText}>▶ Reanudar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.tripControlBtn, styles.tripStopBtn]}
                                                onPress={() => {
                                                    stopTrip();
                                                    setShowTripControls(false);
                                                }}
                                            >
                                                <Text style={styles.tripControlText}>⏹ Detener</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

// ============================================
// ESTILOS COMPLETOS Y MEJORADOS
// ============================================
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    topControls: {
        position: 'absolute',
        top: 10,
        left: 16,
        right: 16,
        zIndex: 10,
    },
    searchContainer: {
        marginBottom: 6,
    },
    // Marcadores
    marker: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
    },
    markerOrigin: {
        backgroundColor: COLORS.SUCCESS + '30',
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        borderColor: COLORS.SUCCESS,
    },
    markerDestination: {
        backgroundColor: COLORS.ERROR + '30',
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        borderColor: COLORS.ERROR,
    },
    markerEmoji: {
        fontSize: 24,
    },
    markerLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.GRAY_700,
        marginTop: 2,
    },
    // Panel inferior
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.WHITE,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 20 : 12,
        maxHeight: height * 0.58,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    // Loading
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.GRAY_700,
    },
    loadingSubtext: {
        marginTop: 4,
        fontSize: 13,
        color: COLORS.GRAY_500,
    },
    progressBar: {
        width: '80%',
        height: 8,
        backgroundColor: COLORS.GRAY_200,
        borderRadius: 4,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.PRIMARY,
        borderRadius: 4,
    },
    // Botón calcular
    calculateButton: {
        backgroundColor: COLORS.PRIMARY,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 8,
    },
    calculateButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Resumen de ruta
    routeSummary: {
        marginBottom: 8,
    },
    routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    routeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.GRAY_900,
    },
    testCaseBadge: {
        backgroundColor: COLORS.PRIMARY + '20',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    testCaseBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.PRIMARY,
    },
    routeStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.GRAY_100,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 4,
    },
    statIcon: {
        fontSize: 13,
        marginRight: 4,
    },
    statText: {
        fontSize: 12,
        color: COLORS.GRAY_700,
        fontWeight: '500',
    },
    // Pasos
    stepsContainer: {
        maxHeight: 160,
        marginBottom: 6,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_100,
    },
    stepNumber: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.GRAY_200,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    stepNumberText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.GRAY_700,
    },
    stepBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    stepBadgeText: {
        fontSize: 16,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.GRAY_900,
    },
    stepInstruction: {
        fontSize: 12,
        color: COLORS.GRAY_600,
        marginTop: 1,
    },
    stepMeta: {
        flexDirection: 'row',
        marginTop: 2,
        gap: 8,
    },
    stepMetaText: {
        fontSize: 10,
        color: COLORS.GRAY_500,
    },
    stepParadas: {
        fontSize: 10,
        color: COLORS.GRAY_400,
        marginTop: 2,
    },
    // Botón inicio
    startButton: {
        backgroundColor: COLORS.SUCCESS,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    startButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Agregar estos estilos nuevos
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerPin: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    markerOrigin: {
        backgroundColor: COLORS.SUCCESS,
    },
    markerDestination: {
        backgroundColor: COLORS.ERROR,
    },
    markerWaypoint: {
        backgroundColor: COLORS.PRIMARY,
    },
    markerEmoji: {
        fontSize: 20,
    },
    markerLabelContainer: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 4,
    },
    markerLabelText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    stepTypeBadge: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.WHITE,
        backgroundColor: COLORS.GRAY_500,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    stepParadasContainer: {
        marginTop: 3,
    },
    stepParadasLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.GRAY_500,
    },
    stepParadas: {
        fontSize: 10,
        color: COLORS.GRAY_600,
        marginTop: 1,
    },
    simulationControls: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_200,
    },
    simulationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.GRAY_700,
        marginBottom: 6,
    },
    simulationButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    simButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    simButtonBlock: {
        backgroundColor: COLORS.ERROR,
    },
    simButtonClear: {
        backgroundColor: COLORS.SUCCESS,
    },
    simButtonText: {
        color: COLORS.WHITE,
        fontWeight: '600',
        fontSize: 13,
    },
    recalculatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        padding: 8,
        backgroundColor: COLORS.WARNING + '20',
        borderRadius: 8,
    },
    recalculatingText: {
        marginLeft: 8,
        fontSize: 13,
        color: COLORS.GRAY_700,
    },
    blockInfo: {
        marginTop: 8,
        padding: 10,
        backgroundColor: COLORS.ERROR + '10',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.ERROR,
    },
    blockText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.ERROR,
    },
    blockDesc: {
        fontSize: 12,
        color: COLORS.GRAY_600,
        marginTop: 2,
    },
    // Agregar al final de styles
    tripControls: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_200,
    },
    tripButton: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: COLORS.PRIMARY,
    },
    tripButtonStart: {
        backgroundColor: COLORS.PRIMARY,
    },
    tripButtonText: {
        color: COLORS.WHITE,
        fontSize: 14,
        fontWeight: 'bold',
    },
    tripStatus: {
        marginTop: 8,
        padding: 10,
        backgroundColor: COLORS.GRAY_100,
        borderRadius: 10,
    },
    tripProgress: {
        height: 8,
        backgroundColor: COLORS.GRAY_300,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
    },
    tripProgressFill: {
        height: '100%',
        backgroundColor: COLORS.PRIMARY,
        borderRadius: 4,
    },
    tripProgressText: {
        position: 'absolute',
        right: 0,
        top: -16,
        fontSize: 10,
        color: COLORS.GRAY_500,
        fontWeight: '600',
    },
    tripInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
        flexWrap: 'wrap',
    },
    tripInfoText: {
        fontSize: 11,
        color: COLORS.GRAY_600,
        marginRight: 4,
        maxWidth: '40%',
    },
    tripControlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 6,
        gap: 6,
    },
    tripControlBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        flex: 1,
        alignItems: 'center',
    },
    tripPauseBtn: {
        backgroundColor: COLORS.WARNING,
    },
    tripResumeBtn: {
        backgroundColor: COLORS.PRIMARY,
    },
    tripStopBtn: {
        backgroundColor: COLORS.ERROR,
    },
    tripControlText: {
        color: COLORS.WHITE,
        fontSize: 12,
        fontWeight: '600',
    },
});