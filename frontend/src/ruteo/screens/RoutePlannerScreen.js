import React, { useState, useEffect, useRef } from 'react';
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
import { getMinibusSegment, TEST_CASES, findRoutesBetween} from '../../services/minibusRoutes';
import { COLORS } from '../../constants/colors';
import { getTelefericoSegment } from '../../services/telefericoRoutes';
import { TELEFERICO_ROUTES } from '../../services/telefericoRoutes';

const { height, width } = Dimensions.get('window');

// Puntos de referencia en La Paz
const WAYPOINTS = {
    'estudiante': [
        {
            latitude: -16.5200,
            longitude: -68.1200,
            nombre: 'Rotonda Obrajes'
        },
    ],
    'trabajador': [
        {
            latitude: -16.5050,
            longitude: -68.1450,
            nombre: 'Puente Trillizos'
        },
    ],
    'turista': [
        {
            latitude: -16.5080,
            longitude: -68.1250,
            nombre: 'Calle 16'
        },
    ],
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
    // CÁLCULO DE RUTA MULTIMODAL (VERSIÓN MEJORADA)
    // ============================================
    const calculateMultimodalRoute = async (waypoints) => {
    setIsCalculating(true);
    setRoute(null);
    
    try {
        // 🔍 Detectar si el caso de prueba incluye teleférico
        const hasTeleferico = selectedTestCase?.teleferico || false;
        const telefericoId = selectedTestCase?.teleferico || null;
        
        // Obtener nombres de paradas
        const fromName = origin.nombre || 'Plaza Murillo';
        const toName = destination.nombre || 'Zona Sur';
        
        let routeId = selectedRouteId;
        if (!routeId) {
            const availableRoutes = findRoutesBetween(fromName, toName);
            if (availableRoutes.length > 0) {
                routeId = availableRoutes[0].routeId;
            } else {
                routeId = 'ruta_44';
            }
        }

        // ============================================
        // CASO CON TELEFÉRICO
        // ============================================
        if (hasTeleferico && telefericoId) {
            console.log(`🚠 Calculando ruta con teleférico: ${telefericoId}`);
            
            // Obtener segmento de teleférico
            const telefericoSegment = getTelefericoSegment(
                telefericoId,
                { nombre: fromName, lat: origin.latitude, lng: origin.longitude },
                { nombre: toName, lat: destination.latitude, lng: destination.longitude },
                'forward'
            );

            if (telefericoSegment) {
                console.log(`✅ Teleférico encontrado: ${telefericoSegment.nombre}`);
                
                // Simular carga
                setLoadingWalk1(true);
                setProgress1(50);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Generar caminata a la estación
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
                    { 
                        latitude: lastCoord.latitude,
                        longitude: lastCoord.longitude
                    },
                    { 
                        latitude: destination.latitude,
                        longitude: destination.longitude
                    }
                );
                setLoadingWalk2(false);
                setProgress3(100);

                // Construir ruta multimodal
                setTimeout(() => {
                    const multimodalRoute = buildMultimodalRoute({
                        walkToFirst: {
                            coordinates: walkCoords1,
                            duration: 5,
                            distance: 0.3,
                        },
                        drivingSegments: [{
                            coordinates: telefericoSegment.coordinates,
                            duration: telefericoSegment.duration,
                            distance: telefericoSegment.distance,
                            nombre: telefericoSegment.nombre,
                            color: telefericoSegment.color,
                            costo: telefericoSegment.costo,
                            tipo: 'TELEFERICO',
                            paradas: telefericoSegment.paradas,
                        }],
                        walkToDestination: {
                            coordinates: walkCoords2,
                            duration: 3,
                            distance: 0.2,
                        },
                        waypoints: waypoints || [],
                    });
                    setRoute(multimodalRoute);
                    setIsCalculating(false);
                    setTimeout(() => fitMapToRoute(multimodalRoute), 300);
                }, 300);
                return;
            }
        }

        // ============================================
        // CASO CON MINIBÚS (original)
        // ============================================
        console.log(`🚐 Calculando ruta con minibús: ${routeId}`);
        
        const minibusSegment = getMinibusSegment(
            routeId,
            { nombre: fromName, lat: origin.latitude, lng: origin.longitude },
            { nombre: toName, lat: destination.latitude, lng: destination.longitude },
            'forward'
        );

            if (minibusSegment) {
                console.log(`✅ Minibús encontrado: ${minibusSegment.nombre}`);
                console.log(`   Paradas: ${minibusSegment.paradas.join(' → ')}`);

                // Simular carga de caminata
                setLoadingWalk1(true);
                setProgress1(30);
                await new Promise(resolve => setTimeout(resolve, 400));

                // Crear ruta de caminata simulada
                const walkCoords1 = generateWalkRoute(
                    { latitude: origin.latitude, longitude: origin.longitude },
                    {
                        latitude: minibusSegment.coordinates[0].latitude,
                        longitude: minibusSegment.coordinates[0].longitude
                    }
                );
                setWalkRoute1({
                    coordinates: walkCoords1,
                    duration: 5,
                    distance: 0.3,
                });
                setLoadingWalk1(false);
                setProgress1(100);

                // Simular carga de minibús
                setLoadingDriving(true);
                setProgress2(30);
                await new Promise(resolve => setTimeout(resolve, 600));

                setDrivingRoute({
                    coordinates: minibusSegment.coordinates,
                    duration: minibusSegment.duration,
                    distance: minibusSegment.distance,
                    nombre: minibusSegment.nombre,
                    color: minibusSegment.color,
                    costo: minibusSegment.costo,
                    paradas: minibusSegment.paradas,
                });
                setLoadingDriving(false);
                setProgress2(100);

                // Simular carga de caminata final
                setLoadingWalk2(true);
                setProgress3(30);
                await new Promise(resolve => setTimeout(resolve, 400));

                const lastCoord = minibusSegment.coordinates[minibusSegment.coordinates.length - 1];
                const walkCoords2 = generateWalkRoute(
                    {
                        latitude: lastCoord.latitude,
                        longitude: lastCoord.longitude
                    },
                    {
                        latitude: destination.latitude,
                        longitude: destination.longitude
                    }
                );
                setWalkRoute2({
                    coordinates: walkCoords2,
                    duration: 3,
                    distance: 0.2,
                });
                setLoadingWalk2(false);
                setProgress3(100);

                // Construir ruta multimodal
                setTimeout(() => {
                    const multimodalRoute = buildMultimodalRoute({
                        walkToFirst: walkRoute1 || {
                            coordinates: walkCoords1,
                            duration: 5,
                            distance: 0.3,
                        },
                        drivingSegments: [drivingRoute || {
                            coordinates: minibusSegment.coordinates,
                            duration: minibusSegment.duration,
                            distance: minibusSegment.distance,
                            nombre: minibusSegment.nombre,
                            color: minibusSegment.color,
                        }],
                        walkToDestination: walkRoute2 || {
                            coordinates: walkCoords2,
                            duration: 3,
                            distance: 0.2,
                        },
                        waypoints: waypoints || [],
                    });
                    setRoute(multimodalRoute);
                    setIsCalculating(false);

                    // Ajustar mapa
                    setTimeout(() => fitMapToRoute(multimodalRoute), 300);
                }, 300);
            } else {
                // 🔧 FALLBACK: Si no encuentra ruta de minibús, crear ruta de caminata
                console.warn('⚠️ No se encontró ruta de minibús, usando caminata');
                Alert.alert(
                    'Ruta no encontrada',
                    'No se encontró una ruta de minibús para este trayecto. Se mostrará una ruta de caminata.',
                    [{ text: 'OK' }]
                );

                // Generar ruta de caminata directa
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
            }
        } catch (error) {
            console.error('Error calculando ruta:', error);
            Alert.alert('Error', 'No se pudo calcular la ruta');
            setIsCalculating(false);
        }
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
                        <Marker coordinate={origin}>
                            <View style={[styles.marker, styles.markerOrigin]}>
                                <Text style={styles.markerEmoji}>📍</Text>
                                <Text style={styles.markerLabel}>Origen</Text>
                            </View>
                        </Marker>
                    )}

                    {/* Destino */}
                    {destination && (
                        <Marker coordinate={destination}>
                            <View style={[styles.marker, styles.markerDestination]}>
                                <Text style={styles.markerEmoji}>🏁</Text>
                                <Text style={styles.markerLabel}>Destino</Text>
                            </View>
                        </Marker>
                    )}

                    {/* Ruta Multimodal */}
                    {route && route.tramos.map((tramo) => (
                        <Polyline
                            key={tramo.id}
                            coordinates={tramo.coordenadas}
                            strokeWidth={5}
                            strokeColor={tramo.color}
                            lineDashPattern={tramo.tipo === 'WALK' ? [5, 5] : undefined}
                        />
                    ))}
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

                    {!isLoading && !route && (
                        <TouchableOpacity
                            style={styles.calculateButton}
                            onPress={() => {
                                const waypoints = WAYPOINTS.estudiante;
                                calculateMultimodalRoute(waypoints);
                            }}
                        >
                            <Text style={styles.calculateButtonText}>
                                🗺️ Calcular Ruta Multimodal
                            </Text>
                        </TouchableOpacity>
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
                                {route.tramos.map((tramo, index) => (
                                    <View key={tramo.id} style={styles.stepItem}>
                                        <View style={styles.stepNumber}>
                                            <Text style={styles.stepNumberText}>{index + 1}</Text>
                                        </View>
                                        <View style={[styles.stepBadge, { backgroundColor: tramo.color }]}>
                                            <Text style={styles.stepBadgeText}>
                                                {tramo.tipo === 'WALK' ? '🚶' : '🚐'}
                                            </Text>
                                        </View>
                                        <View style={styles.stepContent}>
                                            <Text style={styles.stepTitle}>{tramo.nombre}</Text>
                                            <Text style={styles.stepInstruction} numberOfLines={1}>
                                                {tramo.instrucciones}
                                            </Text>
                                            <View style={styles.stepMeta}>
                                                <Text style={styles.stepMetaText}>
                                                    ⏱️ {tramo.duracion} min
                                                </Text>
                                                <Text style={styles.stepMetaText}>
                                                    📏 {tramo.distancia} km
                                                </Text>
                                                {tramo.costo && (
                                                    <Text style={styles.stepMetaText}>
                                                        💰 Bs {tramo.costo}
                                                    </Text>
                                                )}
                                            </View>
                                            {tramo.paradas && tramo.paradas.length > 0 && (
                                                <Text style={styles.stepParadas}>
                                                    🚏 {tramo.paradas.join(' → ')}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
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
});