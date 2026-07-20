import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styles from '../styles/RoutePlannerStyles';
import RouteSummary from './RouteSummary';
import RouteSteps from './RouteSteps';
import BlockSimulation from './BlockSimulation';
import TripSimulation from './TripSimulation';

export const RouteInfoPanel = ({
    route,
    selectedTestCase,
    // Props de bloqueos
    isBlocked,
    blockLocation,
    isRecalculating,
    BLOCK_POINTS,
    startBlockSimulation,
    stopBlockSimulation,
    // Props de viaje
    isTripActive,
    isTripComplete,
    tripProgress,
    currentTransport,
    currentInstruction,
    elapsedTime,
    handleStartTrip,
    pauseTrip,
    resumeTrip,
    stopTrip,
    setShowTripControls,
    // Props de inicio
    origin,
    destination,
}) => {
    if (!route) return null;

    return (
        <>
            {/* Resumen de la ruta */}
            <RouteSummary route={route} selectedTestCase={selectedTestCase} />

            {/* Lista de pasos */}
            <RouteSteps route={route} />

            {/* Controles de simulación de bloqueos */}
            <BlockSimulation
                isBlocked={isBlocked}
                blockLocation={blockLocation}
                isRecalculating={isRecalculating}
                BLOCK_POINTS={BLOCK_POINTS}
                startBlockSimulation={startBlockSimulation}
                stopBlockSimulation={stopBlockSimulation}
            />

            {/* Controles de simulación de viaje */}
            <TripSimulation
                route={route}
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
            />
        </>
    );
};

export default RouteInfoPanel;