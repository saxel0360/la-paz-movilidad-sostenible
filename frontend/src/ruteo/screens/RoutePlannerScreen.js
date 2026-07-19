import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MOCK_RUTA_MULTIMODAL } from '../mocks/mockRuta';
import { SearchBar } from '../components/SearchBar';
import { useTripSimulation } from '../hooks/useTripSimulation';
import { geocodingService } from '../../services/geocodingService';
import { COLORS } from '../../constants/colors';

const { height, width } = Dimensions.get('window');

export default function RoutePlannerScreen() {
    const mapRef = useRef(null);
    const [region, setRegion] = useState({
        latitude: -16.5000,
        longitude: -68.1250,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    // Estado de la ruta y puntos
    const [ruta, setRuta] = useState(MOCK_RUTA_MULTIMODAL);
    const [selectedStep, setSelectedStep] = useState(null);
    const [origin, setOrigin] = useState(MOCK_RUTA_MULTIMODAL.origen);
    const [destination, setDestination] = useState(MOCK_RUTA_MULTIMODAL.destino);

    // Estado de selección
    const [selectionMode, setSelectionMode] = useState(null); // 'origin' | 'destination'
    const [isLoading, setIsLoading] = useState(false);

    // Estado de la simulación
    const [showSimulation, setShowSimulation] = useState(false);
    const {
        isActive,
        isComplete,
        currentPosition,
        progress,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        stopSimulation,
    } = useTripSimulation(ruta, 1.2);

    // Ajustar el mapa para mostrar toda la ruta
    const fitMapToRoute = () => {
        if (!ruta) return;

        const allCoordinates = ruta.tramos.flatMap(tramo => tramo.coordenadas);
        if (allCoordinates.length > 0 && mapRef.current) {
            mapRef.current.fitToCoordinates(allCoordinates, {
                edgePadding: { top: 80, right: 50, bottom: 250, left: 50 },
                animated: true,
            });
        }
    };

    // Ajustar automáticamente al cargar
    useEffect(() => {
        setTimeout(fitMapToRoute, 500);
    }, []);

    // Manejar selección en el mapa
    const handleMapPress = async (event) => {
        if (!selectionMode) return;

        const { latitude, longitude } = event.nativeEvent.coordinate;
        setIsLoading(true);

        try {
            const placeInfo = await geocodingService.reverseGeocode(latitude, longitude);

            const newPoint = {
                latitude,
                longitude,
                nombre: placeInfo.nombre.split(',')[0] || 'Ubicación seleccionada',
                direccion: placeInfo.nombre,
            };

            if (selectionMode === 'origin') {
                setOrigin(newPoint);
                // Actualizar la ruta con el nuevo origen (en MVP usamos mock)
                // En producción, aquí se llamaría al API
                Alert.alert('Origen seleccionado', `📍 ${newPoint.nombre}`);
            } else if (selectionMode === 'destination') {
                setDestination(newPoint);
                Alert.alert('Destino seleccionado', `📍 ${newPoint.nombre}`);
            }

            setSelectionMode(null);
        } catch (error) {
            Alert.alert('Error', 'No se pudo obtener la ubicación');
        } finally {
            setIsLoading(false);
        }
    };

    // Manejar selección desde búsqueda
    const handlePlaceSelect = (place, type) => {
        const point = {
            latitude: place.latitud,
            longitude: place.longitud,
            nombre: place.nombre.split(',')[0],
            direccion: place.nombre,
        };

        if (type === 'origin') {
            setOrigin(point);
            Alert.alert('Origen seleccionado', `📍 ${point.nombre}`);
        } else {
            setDestination(point);
            Alert.alert('Destino seleccionado', `📍 ${point.nombre}`);
        }

        setSelectionMode(null);
    };

    // Obtener ícono según el tipo de transporte
    const getTransportIcon = (tipo) => {
        const icons = {
            WALK: '🚶',
            TELEFERICO: '🚠',
            PUMKATARI: '🚌',
            MINIBUS: '🚐',
            TRUFI: '🚙',
            MICRO: '🚌',
        };
        return icons[tipo] || '🚗';
    };

    // Formatear duración
    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    };

    // Renderizar controles de simulación
    const renderSimulationControls = () => {
        if (!showSimulation) return null;

        return (
            <View style={styles.simulationControls}>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.controlsRow}>
                    {!isActive && !isComplete && (
                        <TouchableOpacity
                            style={[styles.controlButton, styles.startButton]}
                            onPress={startSimulation}
                        >
                            <Text style={styles.controlButtonText}>▶ Iniciar</Text>
                        </TouchableOpacity>
                    )}
                    {isActive && (
                        <>
                            <TouchableOpacity
                                style={[styles.controlButton, styles.pauseButton]}
                                onPress={pauseSimulation}
                            >
                                <Text style={styles.controlButtonText}>⏸ Pausar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.controlButton, styles.stopButton]}
                                onPress={stopSimulation}
                            >
                                <Text style={styles.controlButtonText}>⏹ Detener</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {!isActive && !isComplete && progress > 0 && (
                        <TouchableOpacity
                            style={[styles.controlButton, styles.resumeButton]}
                            onPress={resumeSimulation}
                        >
                            <Text style={styles.controlButtonText}>▶ Reanudar</Text>
                        </TouchableOpacity>
                    )}
                    {isComplete && (
                        <TouchableOpacity
                            style={[styles.controlButton, styles.completeButton]}
                            onPress={stopSimulation}
                        >
                            <Text style={styles.controlButtonText}>✅ Viaje completado</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* 1. MAPA INTERACTIVO */}
            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={StyleSheet.absoluteFillObject}
                initialRegion={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
                onPress={handleMapPress}
                onMapReady={() => console.log('Mapa listo')}
            >
                {/* Marcador de Origen */}
                {origin && (
                    <Marker
                        coordinate={origin}
                        title="Origen"
                        description={origin.nombre}
                        pinColor={COLORS.SUCCESS}
                    >
                        <View style={styles.markerOrigin}>
                            <Text style={styles.markerText}>📍</Text>
                        </View>
                    </Marker>
                )}

                {/* Marcador de Destino */}
                {destination && (
                    <Marker
                        coordinate={destination}
                        title="Destino"
                        description={destination.nombre}
                        pinColor={COLORS.ERROR}
                    >
                        <View style={styles.markerDestination}>
                            <Text style={styles.markerText}>🏁</Text>
                        </View>
                    </Marker>
                )}

                {/* Marcador de seguimiento */}
                {showSimulation && currentPosition && (
                    <Marker coordinate={currentPosition}>
                        <View style={styles.markerCurrent}>
                            <View style={styles.markerPulse} />
                            <Text style={styles.markerCurrentText}>🚗</Text>
                        </View>
                    </Marker>
                )}

                {/* Líneas de la ruta */}
                {ruta.tramos.map((tramo) => (
                    <Polyline
                        key={tramo.id}
                        coordinates={tramo.coordenadas}
                        strokeWidth={5}
                        strokeColor={tramo.color}
                        lineDashPattern={tramo.tipo === 'WALK' ? [5, 5] : undefined}
                    />
                ))}
            </MapView>

            {/* 2. BÚSQUEDA Y CONTROLES SUPERIORES */}
            <View style={styles.topControls}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        placeholder="Seleccionar origen..."
                        icon="📍"
                        onPlaceSelect={(place) => handlePlaceSelect(place, 'origin')}
                    />
                </View>
                <View style={styles.searchContainer}>
                    <SearchBar
                        placeholder="Seleccionar destino..."
                        icon="🏁"
                        onPlaceSelect={(place) => handlePlaceSelect(place, 'destination')}
                    />
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, selectionMode === 'origin' && styles.actionButtonActive]}
                        onPress={() => setSelectionMode('origin')}
                    >
                        <Text style={styles.actionButtonText}>📍 Origen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, selectionMode === 'destination' && styles.actionButtonActive]}
                        onPress={() => setSelectionMode('destination')}
                    >
                        <Text style={styles.actionButtonText}>🏁 Destino</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.fitButton]}
                        onPress={fitMapToRoute}
                    >
                        <Text style={styles.actionButtonText}>🗺️ Ver ruta</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 3. PANEL INFERIOR */}
            <View style={styles.detailsCard}>
                {/* Cabecera con controles de simulación */}
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardTitle}>Ruta multimodal</Text>
                        <View style={styles.routeSummary}>
                            <Text style={styles.summaryText}>
                                {formatDuration(ruta.resumen.duracion_total)} • {ruta.resumen.distancia_total} km
                            </Text>
                            <Text style={styles.summaryText}>
                                • {ruta.resumen.transbordos} transbordos
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.simulateButton, showSimulation && styles.simulateButtonActive]}
                        onPress={() => {
                            setShowSimulation(!showSimulation);
                            if (!showSimulation) {
                                stopSimulation();
                            }
                        }}
                    >
                        <Text style={styles.simulateButtonText}>
                            {showSimulation ? '🔄 Ocultar' : '🎮 Simular'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Controles de simulación */}
                {renderSimulationControls()}

                {/* Lista de pasos */}
                <ScrollView
                    style={styles.stepsContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {ruta.tramos.map((tramo, index) => (
                        <TouchableOpacity
                            key={tramo.id}
                            style={[
                                styles.stepItem,
                                selectedStep === tramo.id && styles.stepItemSelected,
                            ]}
                            onPress={() => setSelectedStep(tramo.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.stepNumber, { backgroundColor: tramo.color }]}>
                                <Text style={styles.stepNumberText}>{index + 1}</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <View style={styles.stepHeader}>
                                    <Text style={styles.stepType}>
                                        {getTransportIcon(tramo.tipo)} {tramo.tipo}
                                    </Text>
                                    <Text style={styles.stepDuration}>{formatDuration(tramo.duracion)}</Text>
                                </View>
                                <Text style={styles.stepLine}>{tramo.nombre_linea}</Text>
                                <Text style={styles.stepInstruction}>{tramo.instrucciones}</Text>
                                <Text style={styles.stepDistance}>{tramo.distancia} km</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Botón de acción */}
                <TouchableOpacity
                    style={styles.startButton}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (!showSimulation) {
                            setShowSimulation(true);
                        }
                        startSimulation();
                    }}
                >
                    <Text style={styles.startButtonText}>Iniciar Recorrido 🚀</Text>
                </TouchableOpacity>
            </View>

            {/* Loading overlay */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                    <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    // Estilos para marcadores
    markerOrigin: {
        backgroundColor: COLORS.SUCCESS,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    markerDestination: {
        backgroundColor: COLORS.ERROR,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    markerCurrent: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    markerPulse: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.PRIMARY + '30',
        borderWidth: 2,
        borderColor: COLORS.PRIMARY + '50',
    },
    markerText: {
        fontSize: 18,
    },
    markerCurrentText: {
        fontSize: 22,
    },

    // Controles superiores
    topControls: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 16,
        right: 16,
        zIndex: 10,
    },
    searchContainer: {
        marginBottom: 6,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    actionButton: {
        backgroundColor: COLORS.WHITE,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        flex: 1,
        marginHorizontal: 3,
        alignItems: 'center',
    },
    actionButtonActive: {
        backgroundColor: COLORS.PRIMARY,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.GRAY_700,
    },
    fitButton: {
        backgroundColor: COLORS.PRIMARY + '20',
    },

    // Panel inferior
    detailsCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.55,
        backgroundColor: COLORS.WHITE,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_200,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.GRAY_900,
    },
    routeSummary: {
        flexDirection: 'row',
        marginTop: 2,
        flexWrap: 'wrap',
    },
    summaryText: {
        fontSize: 12,
        color: COLORS.GRAY_500,
        marginRight: 8,
    },
    simulateButton: {
        backgroundColor: COLORS.GRAY_200,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    simulateButtonActive: {
        backgroundColor: COLORS.PRIMARY + '20',
    },
    simulateButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.GRAY_700,
    },

    // Controles de simulación
    simulationControls: {
        backgroundColor: COLORS.GRAY_100,
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
    },
    progressContainer: {
        height: 8,
        backgroundColor: COLORS.GRAY_300,
        borderRadius: 4,
        marginBottom: 6,
        position: 'relative',
    },
    progressBar: {
        height: 8,
        backgroundColor: COLORS.PRIMARY,
        borderRadius: 4,
    },
    progressText: {
        position: 'absolute',
        right: 0,
        top: -16,
        fontSize: 11,
        color: COLORS.GRAY_500,
        fontWeight: '600',
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    controlButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: 70,
        alignItems: 'center',
    },
    controlButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.WHITE,
    },
    startButton: {
        backgroundColor: COLORS.SUCCESS,
    },
    pauseButton: {
        backgroundColor: COLORS.WARNING,
    },
    stopButton: {
        backgroundColor: COLORS.ERROR,
    },
    resumeButton: {
        backgroundColor: COLORS.PRIMARY,
    },
    completeButton: {
        backgroundColor: COLORS.SUCCESS,
    },

    // Steps
    stepsContainer: {
        flex: 1,
        marginBottom: 6,
    },
    stepItem: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 4,
        backgroundColor: COLORS.GRAY_100,
    },
    stepItemSelected: {
        backgroundColor: COLORS.GRAY_200,
        borderWidth: 1,
        borderColor: COLORS.PRIMARY,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 2,
    },
    stepNumberText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 11,
    },
    stepContent: {
        flex: 1,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 1,
    },
    stepType: {
        fontWeight: '600',
        fontSize: 13,
        color: COLORS.GRAY_700,
    },
    stepDuration: {
        fontSize: 11,
        color: COLORS.GRAY_500,
    },
    stepLine: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.GRAY_900,
        marginBottom: 1,
    },
    stepInstruction: {
        fontSize: 11,
        color: COLORS.GRAY_500,
        marginBottom: 1,
    },
    stepDistance: {
        fontSize: 10,
        color: COLORS.GRAY_300,
    },

    // Botón principal
    startButton: {
        backgroundColor: COLORS.PRIMARY,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 2,
    },
    startButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Loading
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        color: COLORS.WHITE,
        marginTop: 12,
        fontSize: 16,
    },
});