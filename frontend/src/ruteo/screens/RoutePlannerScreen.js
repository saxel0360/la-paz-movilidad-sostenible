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
    SafeAreaView,
    Platform,
    StatusBar,
} from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useWalkingRoute, useDrivingRoute } from '../hooks/useOSRM';
import { SearchBar } from '../components/SearchBar';
import { TestCaseSelector } from '../components/TestCaseSelector';
import { TransportMarker } from '../components/TransportMarker';
import RouteInfoPanel from '../components/RouteInfoPanel';
import { getMinibusSegment, TEST_CASES, findRoutesBetween } from '../../services/minibusRoutes';
import { COLORS } from '../../constants/colors';
import { getTelefericoSegment } from '../../services/telefericoRoutes';
import { TELEFERICO_ROUTES } from '../../services/telefericoRoutes';
import { getCombinedRoute } from '../../services/multimodalService';
import { getPumakatariSegment } from '../../services/pumakatariRoutes';
import { useBlockSimulation } from '../hooks/useBlockSimulation';
import { routeRecalculator } from '../../services/routeRecalculator';
import { useTripSimulation } from '../hooks/useTripSimulation';
import styles from '../styles/RoutePlannerStyles';

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

        const isWalk = tramo.tipo === 'WALK' || tramo.esTransbordo;
        const color = tramo.color || COLORS.PRIMARY;
        const isPunteada = isWalk || tramo.esConexion;

        if (index === 0 || color !== currentColor || isPunteada !== currentSegment.isPunteada) {
            if (currentSegment.length > 0) {
                segments.push({
                    coordinates: [...currentSegment],
                    color: currentColor,
                    isPunteada: currentSegment.isPunteada,
                });
            }
            currentColor = color;
            currentSegment = [];
            currentSegment.isPunteada = isPunteada;
        }

        const coordsToAdd = index === 0
            ? tramo.coordenadas
            : tramo.coordenadas.slice(1);

        currentSegment.push(...coordsToAdd);
        allCoordinates = [...allCoordinates, ...coordsToAdd];
    });

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
    const handleArrival = useCallback((data) => {
        console.log('🎯 ¡Llegaste a tu destino! 🎉');
        console.log(`   📍 ${data.destination}`);
        console.log(`   ⏱️ Tiempo total: ${data.elapsedTime} segundos`);
        console.log(`   🚌 Transporte: ${data.transport}`);

        const message = `📍 ${data.destination}\n⏱️ Tiempo total: ${data.elapsedTime} segundos\n🚌 Transporte: ${data.transport}`;

        Alert.alert(
            '🎉 ¡Llegaste a tu destino!',
            message,
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
    } = useTripSimulation(route, 1.2, handleArrival);

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
    // FUNCIÓN DE RECÁLCULO DE RUTA
    // ============================================
    const handleRecalculate = useCallback((blockPoint) => {
        console.log(`🔄 Recalculando ruta evitando bloqueo en: ${blockPoint.nombre}`);

        if (!route) {
            console.warn('⚠️ No hay ruta para recalcular');
            return null;
        }

        try {
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
    // USAR EL HOOK DE SIMULACIÓN DE BLOQUEOS
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

        const waypoints = WAYPOINTS[testCase.modo.toLowerCase()] || WAYPOINTS.estudiante;

        setTimeout(() => {
            calculateMultimodalRoute(waypoints);
        }, 300);
    };

    // ============================================
    // CALCULAR RUTA COMPLEJA - SIN CAMINATAS EXTRAS
    // ============================================
    const calculateComplexRoute = async (telefericoId, minibusId, pumakatariId) => {
        console.log(`🌀 Calculando ruta compleja`);

        const telefericoSegment = getTelefericoSegment(
            telefericoId,
            { nombre: origin.nombre, lat: origin.latitude, lng: origin.longitude },
            { nombre: destination.nombre, lat: destination.latitude, lng: destination.longitude },
            'forward'
        );

        const midPoint1 = telefericoSegment?.coordinates[telefericoSegment.coordinates.length - 1] || origin;

        const minibusSegment = getMinibusSegment(
            minibusId,
            { nombre: midPoint1.nombre || 'Estación Curva de Olguin', lat: midPoint1.latitude, lng: midPoint1.longitude },
            { nombre: destination.nombre, lat: destination.latitude, lng: destination.longitude },
            'forward'
        );

        const midPoint2 = minibusSegment?.coordinates[minibusSegment.coordinates.length - 1] || destination;

        const pumakatariSegment = getPumakatariSegment(
            pumakatariId,
            { nombre: midPoint2.nombre || 'Parada Av. Ballivián', lat: midPoint2.latitude, lng: midPoint2.longitude },
            { nombre: destination.nombre, lat: destination.latitude, lng: destination.longitude },
            'forward'
        );

        const hasTeleferico = telefericoSegment !== null;
        const hasMinibus = minibusSegment !== null;
        const hasPumakatari = pumakatariSegment !== null;

        console.log(`   Teleférico: ${hasTeleferico ? '✅' : '❌'}`);
        console.log(`   Minibús: ${hasMinibus ? '✅' : '❌'}`);
        console.log(`   PumaKatari: ${hasPumakatari ? '✅' : '❌'}`);

        const tramos = [];

        // 1. Teleférico
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

        // 2. Conexión Teleférico → Minibús
        const lastTelePoint = telefericoSegment.coordinates[telefericoSegment.coordinates.length - 1];
        const firstMinibusPoint = minibusSegment.coordinates[0];

        const distanceTeleMinibus = Math.sqrt(
            Math.pow(lastTelePoint.latitude - firstMinibusPoint.latitude, 2) +
            Math.pow(lastTelePoint.longitude - firstMinibusPoint.longitude, 2)
        );

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

        // 3. Minibús
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

        // 4. Conexión Minibús → PumaKatari
        const lastMinibusPoint = minibusSegment.coordinates[minibusSegment.coordinates.length - 1];
        const firstPumakatariPoint = pumakatariSegment.coordinates[0];

        const distanceMinibusPuma = Math.sqrt(
            Math.pow(lastMinibusPoint.latitude - firstPumakatariPoint.latitude, 2) +
            Math.pow(lastMinibusPoint.longitude - firstPumakatariPoint.longitude, 2)
        );

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

        // 5. PumaKatari
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

        setRoute(routeData);
        setIsCalculating(false);
        setTimeout(() => fitMapToRoute(routeData), 500);
    };

    // ============================================
    // CÁLCULO DE RUTA MULTIMODAL
    // ============================================
    const calculateMultimodalRoute = async () => {
        setIsCalculating(true);
        setRoute(null);

        try {
            const caseType = selectedTestCase?.tipo || 'MINIBUS';
            const telefericoId = selectedTestCase?.teleferico || null;
            const minibusId = selectedTestCase?.ruta_minibus || null;
            const pumakatariId = selectedTestCase?.pumakatari || null;

            console.log(`📋 Tipo de caso: ${caseType}`);
            console.log(`   Teleférico: ${telefericoId}`);
            console.log(`   Minibús: ${minibusId}`);
            console.log(`   PumaKatari: ${pumakatariId}`);

            if (caseType === 'COMPLEJO' && telefericoId && minibusId && pumakatariId) {
                console.log(`🌀 Calculando ruta compleja: ${telefericoId} + ${minibusId} + ${pumakatariId}`);
                await calculateComplexRoute(telefericoId, minibusId, pumakatariId);
                return;
            }

            if (caseType === 'TELEFERICO' && telefericoId) {
                console.log(`🚠 Calculando SOLO teleférico: ${telefericoId}`);
                await calculateTelefericoOnly(telefericoId);
                return;
            }

            if (caseType === 'COMBINADO' && telefericoId && minibusId) {
                console.log(`🔄 Calculando COMBINADO: ${telefericoId} + ${minibusId}`);
                await calculateCombinedRoute(telefericoId, minibusId);
                return;
            }

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

        setLoadingWalk1(true);
        setProgress1(50);
        await new Promise(resolve => setTimeout(resolve, 500));

        const walkCoords1 = generateWalkRoute(
            { latitude: origin.latitude, longitude: origin.longitude },
            {
                latitude: telefericoSegment.coordinates[0].latitude,
                longitude: telefericoSegment.coordinates[0].longitude
            }
        );

        setLoadingWalk1(false);
        setProgress1(100);

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

        const minibusCoordsWithoutFirst = minibusCoords.slice(1);
        const allCoords = [...telefericoCoords, ...minibusCoordsWithoutFirst];

        const tramos = [];

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

    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================
    const generateWalkRoute = (from, to, segments = 8) => {
        const coords = [];
        for (let i = 0; i <= segments; i++) {
            const fraction = i / segments;
            const offset = Math.sin(fraction * Math.PI) * 0.0003;
            coords.push({
                latitude: from.latitude + (to.latitude - from.latitude) * fraction + offset,
                longitude: from.longitude + (to.longitude - from.longitude) * fraction + offset * 0.5,
            });
        }
        return coords;
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
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerPin, styles.markerOriginPin]}>
                                    <Text style={styles.markerEmojiText}>📍</Text>
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
                                <View style={[styles.markerPin, styles.markerDestinationPin]}>
                                    <Text style={styles.markerEmojiText}>🏁</Text>
                                </View>
                                <View style={styles.markerLabelContainer}>
                                    <Text style={styles.markerLabelText}>Destino</Text>
                                </View>
                            </View>
                        </Marker>
                    )}

                    {/* Waypoints */}
                    {WAYPOINTS.map((wp, index) => (
                        <Marker
                            key={index}
                            coordinate={wp}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerPin, styles.markerWaypointPin]}>
                                    <Text style={styles.markerEmojiText}>🔄</Text>
                                </View>
                                <View style={styles.markerLabelContainer}>
                                    <Text style={styles.markerLabelText}>Transbordo</Text>
                                </View>
                            </View>
                        </Marker>
                    ))}

                    {/* Ruta Multimodal - LÍNEA CONTINUA */}
                    {route && route.continuousRoute && (
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

                    {/* Fallback: tramos individuales */}
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
                    {/* CASOS DE PRUEBA 
                    <TestCaseSelector
                        onSelect={handleTestCaseSelect}
                        selectedCase={selectedTestCase}
                    />
                    {/* fin de CASOS DE PRUEBA */}

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

                    {/* CASOS DE PRUEBA 
                    {route && !isLoading && (
                        <RouteInfoPanel
                            route={route}
                            selectedTestCase={selectedTestCase}
                            // Props de bloqueos
                            isBlocked={isBlocked}
                            blockLocation={blockLocation}
                            isRecalculating={isRecalculating}
                            BLOCK_POINTS={BLOCK_POINTS}
                            startBlockSimulation={startBlockSimulation}
                            stopBlockSimulation={stopBlockSimulation}
                            // Props de viaje
                            isTripActive={isTripActive}
                            isTripComplete={isTripComplete}
                            tripProgress={tripProgress}
                            currentTransport={currentTransport}
                            currentInstruction={currentInstruction}
                            elapsedTime={elapsedTime}
                            handleStartTrip={handleStartTrip}
                            pauseTrip={pauseTrip}
                            resumeTrip={resumeTrip}
                            stopTrip={stopTrip}
                            setShowTripControls={setShowTripControls}
                            // Props de inicio
                            origin={origin}
                            destination={destination}
                        />
                    )}
                    {/* fin de CASOS DE PRUEBA */}
                </View>
            </View>
        </SafeAreaView>
    );
}