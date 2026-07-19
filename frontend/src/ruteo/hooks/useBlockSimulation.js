import { useState, useEffect, useRef } from 'react';

// Puntos de bloqueo predefinidos en La Paz
export const BLOCK_POINTS = {
    'av_6_marzo': {
        lat: -16.5150,
        lng: -68.1600,
        nombre: 'Av. 6 de Marzo - Bloqueo',
        descripcion: 'Bloqueo en Av. 6 de Marzo por manifestación',
        afecta: ['minibus', 'pumakatari'],
    },
    'puente_trillizos': {
        lat: -16.5050,
        lng: -68.1450,
        nombre: 'Puente Trillizos - Bloqueo',
        descripcion: 'Bloqueo en Puente Trillizos por accidente',
        afecta: ['minibus', 'pumakatari'],
    },
    'av_ballivian': {
        lat: -16.5140,
        lng: -68.1220,
        nombre: 'Av. Ballivián - Bloqueo',
        descripcion: 'Bloqueo en Av. Ballivián por obras',
        afecta: ['minibus'],
    },
};

/**
 * Hook para simular bloqueos en la ruta y recálculo
 */
export const useBlockSimulation = (route, onRecalculate) => {
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockLocation, setBlockLocation] = useState(null);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [blockedRoute, setBlockedRoute] = useState(null);
    const [showBlockOptions, setShowBlockOptions] = useState(false);
    const intervalRef = useRef(null);

    // Iniciar simulación de bloqueo
    const startBlockSimulation = (blockPoint) => {
        if (!blockPoint) {
            // Seleccionar un bloqueo aleatorio
            const keys = Object.keys(BLOCK_POINTS);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            blockPoint = BLOCK_POINTS[randomKey];
        }

        console.log(`🚧 Bloqueo activado en: ${blockPoint.nombre}`);
        setIsBlocked(true);
        setBlockLocation(blockPoint);
        setIsRecalculating(true);

        // Simular recálculo después de 2 segundos
        setTimeout(() => {
            if (onRecalculate) {
                try {
                    console.log('🔄 Ejecutando recálculo...');
                    const newRoute = onRecalculate(blockPoint);
                    if (newRoute) {
                        setBlockedRoute(newRoute);
                        console.log('✅ Ruta recalculada exitosamente');
                    } else {
                        console.warn('⚠️ No se pudo recalcular la ruta');
                    }
                } catch (error) {
                    console.error('❌ Error en recálculo:', error);
                }
            } else {
                console.warn('⚠️ No hay función de recálculo disponible');
            }
            setIsRecalculating(false);
        }, 2000);
    };

    // Detener simulación
    const stopBlockSimulation = () => {
        console.log('🚧 Bloqueo finalizado');
        setIsBlocked(false);
        setBlockLocation(null);
        setBlockedRoute(null);
        setIsRecalculating(false);
        setShowBlockOptions(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    // Limpieza
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        isBlocked,
        blockLocation,
        isRecalculating,
        blockedRoute,
        showBlockOptions,
        setShowBlockOptions,
        startBlockSimulation,
        stopBlockSimulation,
        BLOCK_POINTS,
    };
};