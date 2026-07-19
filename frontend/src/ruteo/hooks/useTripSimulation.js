import { useState, useEffect, useRef } from 'react';

export const useTripSimulation = (route, speed = 1) => {
    const [isActive, setIsActive] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const animationRef = useRef(null);
    const intervalRef = useRef(null);

    // Extraer todas las coordenadas de la ruta en orden
    const getAllCoordinates = () => {
        if (!route) return [];
        const coords = [];
        route.tramos.forEach(tramo => {
            coords.push(...tramo.coordenadas);
        });
        return coords;
    };

    // Calcular distancia entre dos puntos (fórmula de Haversine)
    const calculateDistance = (point1, point2) => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
        const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Interpolar posición entre dos puntos
    const interpolatePosition = (point1, point2, fraction) => {
        return {
            latitude: point1.latitude + (point2.latitude - point1.latitude) * fraction,
            longitude: point1.longitude + (point2.longitude - point1.longitude) * fraction,
        };
    };

    // Iniciar simulación
    const startSimulation = () => {
        if (!route) return;
        setIsActive(true);
        setIsComplete(false);
        setCurrentStepIndex(0);
        setProgress(0);

        const coordinates = getAllCoordinates();
        if (coordinates.length > 0) {
            setCurrentPosition(coordinates[0]);
        }
    };

    // Pausar simulación
    const pauseSimulation = () => {
        setIsActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    // Reanudar simulación
    const resumeSimulation = () => {
        if (!isComplete) {
            setIsActive(true);
        }
    };

    // Detener y reiniciar
    const stopSimulation = () => {
        setIsActive(false);
        setIsComplete(false);
        setCurrentStepIndex(0);
        setProgress(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        const coordinates = getAllCoordinates();
        if (coordinates.length > 0) {
            setCurrentPosition(coordinates[0]);
        }
    };

    // Efecto principal de simulación
    useEffect(() => {
        if (!isActive || !route) return;

        const coordinates = getAllCoordinates();
        if (coordinates.length < 2) return;

        let currentIndex = 0;
        let segmentProgress = 0;
        const stepSize = 0.01 * speed; // Velocidad de avance

        intervalRef.current = setInterval(() => {
            if (currentIndex >= coordinates.length - 1) {
                // Llegamos al final
                setIsActive(false);
                setIsComplete(true);
                setCurrentPosition(coordinates[coordinates.length - 1]);
                setProgress(100);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                return;
            }

            const point1 = coordinates[currentIndex];
            const point2 = coordinates[currentIndex + 1];

            segmentProgress += stepSize;

            if (segmentProgress >= 1) {
                // Pasamos al siguiente segmento
                currentIndex++;
                segmentProgress = 0;
                setCurrentStepIndex(currentIndex);
            }

            const newPosition = interpolatePosition(point1, point2, Math.min(segmentProgress, 1));
            setCurrentPosition(newPosition);

            // Calcular progreso total
            const totalSegments = coordinates.length - 1;
            const totalProgress = (currentIndex + segmentProgress) / totalSegments;
            setProgress(Math.min(totalProgress * 100, 100));

        }, 100); // Actualizar cada 100ms

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, route, speed]);

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return {
        isActive,
        isComplete,
        currentPosition,
        currentStepIndex,
        progress,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        stopSimulation,
    };
};