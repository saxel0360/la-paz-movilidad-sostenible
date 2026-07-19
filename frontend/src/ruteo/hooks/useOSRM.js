import { useState, useEffect, useRef } from 'react';
import { OSRMClient, ROUTE_PROFILES } from '../../services/osrmService';

/**
 * Hook para calcular rutas usando OSRM
 */
export const useOSRM = (origin, destination, profile = 'walking', options = { enabled: true }) => {
    const [route, setRoute] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        // Limpiar request anterior
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (!options.enabled || !origin || !destination) {
            setRoute(null);
            setIsLoading(false);
            return;
        }

        const fetchRoute = async () => {
            abortControllerRef.current = new AbortController();
            setIsLoading(true);
            setError(null);
            setProgress(0);

            try {
                // Simular progreso
                const progressInterval = setInterval(() => {
                    setProgress(prev => Math.min(prev + 10, 90));
                }, 200);

                let result;
                if (profile === ROUTE_PROFILES.WALK) {
                    result = await OSRMClient.getWalkingRoute(origin, destination);
                } else if (profile === ROUTE_PROFILES.DRIVING) {
                    result = await OSRMClient.getDrivingRoute(origin, destination);
                } else {
                    result = await OSRMClient.getRoute(origin, destination, profile);
                }

                clearInterval(progressInterval);
                setProgress(100);
                
                // Pequeño delay para que se vea el 100%
                await new Promise(resolve => setTimeout(resolve, 100));
                
                setRoute(result);
                setIsLoading(false);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                    // Fallback: ruta en línea recta
                    const fallback = await OSRMClient.getRoute(origin, destination, profile);
                    setRoute(fallback);
                }
                setIsLoading(false);
            }
        };

        fetchRoute();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [origin, destination, profile, options.enabled]);

    return { route, isLoading, error, progress };
};

/**
 * Hook específico para rutas de caminata
 */
export const useWalkingRoute = (origin, destination, enabled = true) => {
    return useOSRM(origin, destination, ROUTE_PROFILES.WALK, { enabled });
};

/**
 * Hook específico para rutas de vehículos
 */
export const useDrivingRoute = (origin, destination, enabled = true) => {
    return useOSRM(origin, destination, ROUTE_PROFILES.DRIVING, { enabled });
};