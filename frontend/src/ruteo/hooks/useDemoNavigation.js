import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  buildInitialDemoRoute,
  DEFAULT_ROUTE_PREFERENCES,
  findNearestDemoNode,
  runDemoScenario,
} from "../engine/demoRouteEngine";

import {
  LA_PAZ_DEMO_CONFIG,
  LA_PAZ_DEMO_NODES,
} from "../graphs/laPazDemoGraph";

export const NAVIGATION_STATUS = {
  IDLE: "IDLE",
  ROUTE_READY: "ROUTE_READY",
  NAVIGATING: "NAVIGATING",
  PAUSED: "PAUSED",
  RECALCULATING: "RECALCULATING",
  REROUTED: "REROUTED",
  NO_ROUTE: "NO_ROUTE",
  ARRIVED: "ARRIVED",
};

const SIMULATION_INTERVAL_MS = 1100;

export const useDemoNavigation = () => {
  const [status, setStatus] = useState(
    NAVIGATION_STATUS.IDLE
  );

  const [preferences, setPreferences] =
    useState(DEFAULT_ROUTE_PREFERENCES);

  const [initialResult, setInitialResult] =
    useState(null);

  const [currentResult, setCurrentResult] =
    useState(null);

  const [selectedScenarioId, setSelectedScenarioId] =
    useState("normal");

  const [currentPosition, setCurrentPosition] =
    useState(null);

  const [currentCoordinateIndex, setCurrentCoordinateIndex] =
    useState(0);

  const [progress, setProgress] = useState(0);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [isScenarioApplied, setIsScenarioApplied] =
    useState(false);

  const intervalRef = useRef(null);
  const coordinateIndexRef = useRef(0);
  const elapsedSecondsRef = useRef(0);
  const scenarioAppliedRef = useRef(false);

  const mapRoute = currentResult?.mapRoute || null;
  const currentPath = currentResult?.path || null;

  const coordinates = useMemo(() => {
    return Array.isArray(mapRoute?.coordenadas)
      ? mapRoute.coordenadas
      : [];
  }, [mapRoute]);

  const clearSimulationInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetSimulationValues = useCallback(() => {
    clearSimulationInterval();

    coordinateIndexRef.current = 0;
    elapsedSecondsRef.current = 0;
    scenarioAppliedRef.current = false;

    setCurrentCoordinateIndex(0);
    setElapsedSeconds(0);
    setProgress(0);
    setIsScenarioApplied(false);
  }, [clearSimulationInterval]);

  const calculateInitial = useCallback(
    (nextPreferences = preferences) => {
      resetSimulationValues();

      const result = buildInitialDemoRoute(
        nextPreferences
      );

      setInitialResult(result);
      setCurrentResult(result);

      if (result.success && result.mapRoute) {
        const firstCoordinate =
          result.mapRoute.coordenadas?.[0] || null;

        setCurrentPosition(firstCoordinate);
        setStatus(NAVIGATION_STATUS.ROUTE_READY);
      } else {
        setCurrentPosition(null);
        setStatus(NAVIGATION_STATUS.NO_ROUTE);
      }

      return result;
    },
    [preferences, resetSimulationValues]
  );

  useEffect(() => {
    calculateInitial(DEFAULT_ROUTE_PREFERENCES);

    return () => {
      clearSimulationInterval();
    };
  }, []);

  const applyScenario = useCallback(
    (scenarioId) => {
      setSelectedScenarioId(scenarioId);
      setStatus(NAVIGATION_STATUS.RECALCULATING);

      const nearestNode =
        findNearestDemoNode(currentPosition);

      const currentNodeId =
        nearestNode?.id ||
        LA_PAZ_DEMO_CONFIG.startNodeId;

      const result = runDemoScenario({
        scenarioId,
        currentNodeId,
        previousPath: currentPath,
        preferences,
      });

      setCurrentResult(result);

      if (!result.success || !result.mapRoute) {
        clearSimulationInterval();
        setStatus(NAVIGATION_STATUS.NO_ROUTE);

        scenarioAppliedRef.current = true;
        setIsScenarioApplied(true);

        return result;
      }

      coordinateIndexRef.current = 0;
      setCurrentCoordinateIndex(0);

      const firstCoordinate =
        result.mapRoute.coordenadas?.[0] ||
        currentPosition;

      setCurrentPosition(firstCoordinate);

      scenarioAppliedRef.current = true;
      setIsScenarioApplied(true);

      setStatus(
        scenarioId === "normal"
          ? NAVIGATION_STATUS.NAVIGATING
          : NAVIGATION_STATUS.REROUTED
      );

      return result;
    },
    [
      clearSimulationInterval,
      currentPath,
      currentPosition,
      preferences,
    ]
  );

  const startSimulation = useCallback(() => {
    if (!mapRoute || coordinates.length === 0) {
      return;
    }

    clearSimulationInterval();

    setStatus(NAVIGATION_STATUS.NAVIGATING);

    intervalRef.current = setInterval(() => {
      const lastIndex = coordinates.length - 1;

      if (
        coordinateIndexRef.current >= lastIndex
      ) {
        clearSimulationInterval();

        setProgress(100);
        setStatus(NAVIGATION_STATUS.ARRIVED);

        return;
      }

      const nextIndex =
        coordinateIndexRef.current + 1;

      coordinateIndexRef.current = nextIndex;

      elapsedSecondsRef.current += 1;

      setCurrentCoordinateIndex(nextIndex);
      setElapsedSeconds(
        elapsedSecondsRef.current
      );

      setCurrentPosition(
        coordinates[nextIndex]
      );

      const nextProgress =
        lastIndex > 0
          ? Math.round(
              (nextIndex / lastIndex) * 100
            )
          : 100;

      setProgress(nextProgress);

      /*
       * Aplicación automática del escenario
       * durante la simulación.
       */
      if (
        selectedScenarioId !== "normal" &&
        !scenarioAppliedRef.current &&
        nextProgress >= 25
      ) {
        applyScenario(selectedScenarioId);
      }
    }, SIMULATION_INTERVAL_MS);
  }, [
    applyScenario,
    clearSimulationInterval,
    coordinates,
    mapRoute,
    selectedScenarioId,
  ]);

  const pauseSimulation = useCallback(() => {
    clearSimulationInterval();

    setStatus(NAVIGATION_STATUS.PAUSED);
  }, [clearSimulationInterval]);

  const resumeSimulation = useCallback(() => {
    startSimulation();
  }, [startSimulation]);

  const stopSimulation = useCallback(() => {
    clearSimulationInterval();

    setStatus(NAVIGATION_STATUS.ROUTE_READY);
  }, [clearSimulationInterval]);

  const resetSimulation = useCallback(() => {
    calculateInitial(preferences);
  }, [calculateInitial, preferences]);

  const selectScenario = useCallback(
    (scenarioId) => {
      clearSimulationInterval();

      setSelectedScenarioId(scenarioId);

      scenarioAppliedRef.current = false;
      setIsScenarioApplied(false);

      calculateInitial(preferences);
    },
    [
      calculateInitial,
      clearSimulationInterval,
      preferences,
    ]
  );

  const updatePreferences = useCallback(
    (nextPreferences) => {
      const mergedPreferences = {
        ...preferences,
        ...nextPreferences,
      };

      setPreferences(mergedPreferences);
      calculateInitial(mergedPreferences);
    },
    [calculateInitial, preferences]
  );

  const currentNode = useMemo(() => {
    return findNearestDemoNode(
      currentPosition
    );
  }, [currentPosition]);

  const currentInstruction = useMemo(() => {
    if (!mapRoute?.tramos?.length) {
      return "No existe una instrucción disponible.";
    }

    const routeCoordinates =
      mapRoute.coordenadas || [];

    const coordinate =
      routeCoordinates[
        currentCoordinateIndex
      ];

    if (!coordinate) {
      return mapRoute.tramos[0].instrucciones;
    }

    const nearestNode =
      findNearestDemoNode(coordinate);

    const tramo =
      mapRoute.tramos.find(
        (item) =>
          item.origen?.id === nearestNode?.id
      ) || mapRoute.tramos[mapRoute.tramos.length - 1];

    return (
      tramo?.instrucciones ||
      "Continúa siguiendo la ruta."
    );
  }, [
    currentCoordinateIndex,
    mapRoute,
  ]);

  return {
    status,
    preferences,

    initialResult,
    currentResult,

    mapRoute,
    currentPath,

    selectedScenarioId,
    isScenarioApplied,

    currentPosition,
    currentNode,
    currentInstruction,

    currentCoordinateIndex,
    progress,
    elapsedSeconds,

    originNode:
      LA_PAZ_DEMO_NODES[
        LA_PAZ_DEMO_CONFIG.startNodeId
      ],

    destinationNode:
      LA_PAZ_DEMO_NODES[
        LA_PAZ_DEMO_CONFIG.endNodeId
      ],

    calculateInitial,
    applyScenario,
    selectScenario,
    updatePreferences,

    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
  };
};