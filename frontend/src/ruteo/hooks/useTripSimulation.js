import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para simular un viaje en tiempo real
 * Versión CORREGIDA - sin múltiples llamadas
 */
export const useTripSimulation = (route, speed = 1, onArrival = null) => {
    const [isActive, setIsActive] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [currentTransport, setCurrentTransport] = useState(null);
    const [currentInstruction, setCurrentInstruction] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [routePoints, setRoutePoints] = useState([]);
    
    const intervalRef = useRef(null);
    const timeRef = useRef(null);
    const segmentProgressRef = useRef(0);
    const isActiveRef = useRef(false);
    const isCompleteRef = useRef(false);
    const isInitializedRef = useRef(false);
    const hasTriggeredArrivalRef = useRef(false);
    const arrivalTimeoutRef = useRef(null);

    // Obtener los puntos de la ruta
    useEffect(() => {
        if (!route || !route.tramos) {
            setRoutePoints([]);
            return;
        }
        
        const points = [];
        route.tramos.forEach((tramo) => {
            if (tramo.coordenadas && tramo.coordenadas.length > 0) {
                const transportType = tramo.tipo || 'WALK';
                const transportIcon = getTransportIcon(transportType);
                const transportColor = tramo.color || COLORS.WALK;
                const instruction = tramo.instrucciones || '';
                
                tramo.coordenadas.forEach((coord) => {
                    points.push({
                        latitude: coord.latitude,
                        longitude: coord.longitude,
                        transportType: transportType,
                        transportIcon: transportIcon,
                        transportColor: transportColor,
                        instruction: instruction,
                        tramoName: tramo.nombre || '',
                    });
                });
            }
        });
        
        setRoutePoints(points);
        isInitializedRef.current = false;
        hasTriggeredArrivalRef.current = false;
        
        if (points.length > 0) {
            setCurrentPosition(points[0]);
            setCurrentTransport(points[0].transportType);
            setCurrentInstruction(points[0].instruction);
            setCurrentIndex(0);
            setProgress(0);
            segmentProgressRef.current = 0;
        }
    }, [route]);

    const getTransportIcon = (type) => {
        const icons = {
            'WALK': '🚶',
            'TELEFERICO': '🚠',
            'MINIBUS': '🚐',
            'PUMAKATARI': '🚌',
            'MIXTO': '🚌',
        };
        return icons[type] || '🚗';
    };

    // Función para disparar la llegada (SOLO UNA VEZ)
    const triggerArrival = useCallback(() => {
        // ✅ Evitar múltiples llamadas
        if (hasTriggeredArrivalRef.current) {
            console.log('⚠️ Llegada ya fue notificada, ignorando');
            return;
        }
        hasTriggeredArrivalRef.current = true;
        
        console.log('🎯 ¡Llegaste a tu destino! 🎉');
        
        if (onArrival && typeof onArrival === 'function') {
            // ✅ Usar setTimeout para evitar llamadas múltiples
            if (arrivalTimeoutRef.current) {
                clearTimeout(arrivalTimeoutRef.current);
            }
            arrivalTimeoutRef.current = setTimeout(() => {
                onArrival({
                    destination: route?.destino?.nombre || 'Destino',
                    elapsedTime: elapsedTime,
                    transport: currentTransport || 'Caminata',
                    totalPoints: routePoints.length,
                });
                arrivalTimeoutRef.current = null;
            }, 100);
        }
    }, [onArrival, route, elapsedTime, currentTransport, routePoints]);

    // Iniciar simulación
    const startSimulation = useCallback(() => {
        if (routePoints.length < 2) {
            console.warn('⚠️ No hay suficientes puntos para simular');
            return;
        }
        
        // Limpiar timeouts anteriores
        if (arrivalTimeoutRef.current) {
            clearTimeout(arrivalTimeoutRef.current);
            arrivalTimeoutRef.current = null;
        }
        
        // Detener cualquier simulación anterior
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeRef.current) {
            clearInterval(timeRef.current);
            timeRef.current = null;
        }
        
        // Resetear todo
        segmentProgressRef.current = 0;
        setCurrentIndex(0);
        setProgress(0);
        setElapsedTime(0);
        setIsComplete(false);
        isCompleteRef.current = false;
        isInitializedRef.current = false;
        hasTriggeredArrivalRef.current = false;
        
        if (routePoints.length > 0) {
            setCurrentPosition(routePoints[0]);
            setCurrentTransport(routePoints[0].transportType);
            setCurrentInstruction(routePoints[0].instruction);
        }
        
        setIsActive(true);
        isActiveRef.current = true;
        
        console.log('🚀 Viaje iniciado!');
        console.log(`📍 Puntos totales: ${routePoints.length}`);
    }, [routePoints]);

    // Pausar simulación
    const pauseSimulation = useCallback(() => {
        setIsActive(false);
        isActiveRef.current = false;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeRef.current) {
            clearInterval(timeRef.current);
            timeRef.current = null;
        }
    }, []);

    // Reanudar simulación
    const resumeSimulation = useCallback(() => {
        if (!isCompleteRef.current && currentPosition && routePoints.length > 0) {
            setIsActive(true);
            isActiveRef.current = true;
        }
    }, [currentPosition, routePoints]);

    // Detener simulación
    const stopSimulation = useCallback(() => {
        setIsActive(false);
        isActiveRef.current = false;
        setIsComplete(false);
        isCompleteRef.current = false;
        setCurrentIndex(0);
        setProgress(0);
        setElapsedTime(0);
        segmentProgressRef.current = 0;
        isInitializedRef.current = false;
        hasTriggeredArrivalRef.current = false;
        
        if (arrivalTimeoutRef.current) {
            clearTimeout(arrivalTimeoutRef.current);
            arrivalTimeoutRef.current = null;
        }
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeRef.current) {
            clearInterval(timeRef.current);
            timeRef.current = null;
        }
        
        if (routePoints.length > 0) {
            setCurrentPosition(routePoints[0]);
            setCurrentTransport(routePoints[0].transportType);
            setCurrentInstruction(routePoints[0].instruction);
        }
        
        console.log('⏹️ Viaje detenido');
    }, [routePoints]);

    // Efecto de simulación
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // ✅ Solo ejecutar si está activo y no está completo
        if (!isActive || routePoints.length < 2 || isCompleteRef.current || isInitializedRef.current) {
            return;
        }

        isInitializedRef.current = true;

        console.log(`▶️ Iniciando loop de simulación con ${routePoints.length} puntos`);

        intervalRef.current = setInterval(() => {
            // ✅ Verificar estado antes de cada iteración
            if (!isActiveRef.current || isCompleteRef.current) {
                return;
            }

            const totalPoints = routePoints.length;
            let currentIdx = currentIndex;
            let segmentProgress = segmentProgressRef.current;
            
            segmentProgress += 0.02 * speed;
            
            if (segmentProgress >= 1) {
                currentIdx++;
                segmentProgress = 0;
                
                if (currentIdx >= totalPoints - 1) {
                    // ✅ Llegamos al final - SOLO UNA VEZ
                    isActiveRef.current = false;
                    setIsActive(false);
                    setIsComplete(true);
                    isCompleteRef.current = true;
                    isInitializedRef.current = false;
                    
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    if (timeRef.current) {
                        clearInterval(timeRef.current);
                        timeRef.current = null;
                    }
                    
                    const lastPoint = routePoints[totalPoints - 1];
                    setCurrentPosition(lastPoint);
                    setCurrentTransport(lastPoint.transportType);
                    setCurrentInstruction(lastPoint.instruction);
                    setProgress(100);
                    setCurrentIndex(totalPoints - 1);
                    
                    // ✅ Disparar llegada SOLO UNA VEZ
                    triggerArrival();
                    
                    return;
                }
                
                setCurrentIndex(currentIdx);
                const newPoint = routePoints[currentIdx];
                setCurrentTransport(newPoint.transportType);
                setCurrentInstruction(newPoint.instruction);
                setCurrentPosition(newPoint);
                segmentProgressRef.current = 0;
            } else {
                const point1 = routePoints[currentIdx];
                const point2 = routePoints[Math.min(currentIdx + 1, totalPoints - 1)];
                
                const fraction = segmentProgress;
                const newPosition = {
                    latitude: point1.latitude + (point2.latitude - point1.latitude) * fraction,
                    longitude: point1.longitude + (point2.longitude - point1.longitude) * fraction,
                };
                
                setCurrentPosition(newPosition);
                segmentProgressRef.current = segmentProgress;
            }
            
            const totalSegments = totalPoints - 1;
            const totalProgress = (currentIdx + segmentProgress) / totalSegments;
            setProgress(Math.min(totalProgress * 100, 100));
            
        }, 150);

        if (timeRef.current) {
            clearInterval(timeRef.current);
        }
        timeRef.current = setInterval(() => {
            if (isActiveRef.current && !isCompleteRef.current) {
                setElapsedTime(prev => prev + 1);
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeRef.current) {
                clearInterval(timeRef.current);
                timeRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, [isActive, routePoints, speed, currentIndex, triggerArrival]);

    return {
        isActive,
        isComplete,
        currentPosition,
        progress,
        currentTransport,
        currentInstruction,
        elapsedTime,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        stopSimulation,
        getTransportIcon,
    };
};