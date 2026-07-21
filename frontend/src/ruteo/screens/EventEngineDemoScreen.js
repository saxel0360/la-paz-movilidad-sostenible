import React, {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import MapView, {
  Marker,
  Polyline,
} from "react-native-maps";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  DEMO_SCENARIOS,
} from "../mocks/demoTrafficEvents";

import {
  NAVIGATION_STATUS,
  useDemoNavigation,
} from "../hooks/useDemoNavigation";

const INITIAL_REGION = {
  latitude: -16.515,
  longitude: -68.115,
  latitudeDelta: 0.075,
  longitudeDelta: 0.075,
};

const getStatusInformation = (status) => {
  const statusData = {
    [NAVIGATION_STATUS.IDLE]: {
      label: "Sin iniciar",
      icon: "⚪",
      color: "#64748B",
    },

    [NAVIGATION_STATUS.ROUTE_READY]: {
      label: "Ruta preparada",
      icon: "🟢",
      color: "#16A34A",
    },

    [NAVIGATION_STATUS.NAVIGATING]: {
      label: "Navegación activa",
      icon: "🧭",
      color: "#2563EB",
    },

    [NAVIGATION_STATUS.PAUSED]: {
      label: "Viaje pausado",
      icon: "⏸️",
      color: "#D97706",
    },

    [NAVIGATION_STATUS.RECALCULATING]: {
      label: "Recalculando ruta",
      icon: "🧠",
      color: "#7C3AED",
    },

    [NAVIGATION_STATUS.REROUTED]: {
      label: "Ruta recalculada",
      icon: "🔄",
      color: "#EA580C",
    },

    [NAVIGATION_STATUS.NO_ROUTE]: {
      label: "Sin ruta disponible",
      icon: "⛔",
      color: "#DC2626",
    },

    [NAVIGATION_STATUS.ARRIVED]: {
      label: "Destino alcanzado",
      icon: "🏁",
      color: "#16A34A",
    },
  };

  return (
    statusData[status] || {
      label: status,
      icon: "ℹ️",
      color: "#64748B",
    }
  );
};

const getScenarioById = (scenarioId) => {
  return DEMO_SCENARIOS.find(
    (scenario) =>
      scenario.id === scenarioId
  );
};

const formatNumber = (
  value,
  decimals = 1
) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return "0";
  }

  return parsedValue.toFixed(decimals);
};

export default function EventEngineDemoScreen({
  navigation,
}) {
  const mapRef = useRef(null);
  const arrivalAlertShownRef = useRef(false);

  const {
    status,
    preferences,

    currentResult,
    mapRoute,

    selectedScenarioId,
    isScenarioApplied,

    currentPosition,
    currentNode,
    currentInstruction,

    progress,
    elapsedSeconds,

    originNode,
    destinationNode,

    selectScenario,
    updatePreferences,
    applyScenario,

    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
  } = useDemoNavigation();

  const statusInformation =
    getStatusInformation(status);

  const selectedScenario =
    getScenarioById(selectedScenarioId);

  const routeCoordinates = useMemo(() => {
    return Array.isArray(
      mapRoute?.coordenadas
    )
      ? mapRoute.coordenadas
      : [];
  }, [mapRoute]);

  const activeEvents =
    currentResult?.activeEvents || [];

  const metrics =
    currentResult?.metrics || {};

  const routeSummary =
    mapRoute?.resumen || {};

  const comparison =
    currentResult?.comparison || null;

  const isNavigating =
    status ===
    NAVIGATION_STATUS.NAVIGATING;

  const isPaused =
    status === NAVIGATION_STATUS.PAUSED;

  const isNoRoute =
    status === NAVIGATION_STATUS.NO_ROUTE;

  const isArrived =
    status === NAVIGATION_STATUS.ARRIVED;

  useEffect(() => {
    if (
      routeCoordinates.length < 2 ||
      !mapRef.current
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        routeCoordinates,
        {
          edgePadding: {
            top: 90,
            right: 50,
            bottom: 90,
            left: 50,
          },

          animated: true,
        }
      );
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [routeCoordinates]);

  useEffect(() => {
    if (
      !currentPosition ||
      !mapRef.current
    ) {
      return;
    }

    if (
      status !==
        NAVIGATION_STATUS.NAVIGATING &&
      status !==
        NAVIGATION_STATUS.REROUTED
    ) {
      return;
    }

    mapRef.current.animateCamera(
      {
        center: currentPosition,
        zoom: 14,
      },
      {
        duration: 600,
      }
    );
  }, [currentPosition, status]);

  useEffect(() => {
    if (!isArrived) {
      arrivalAlertShownRef.current = false;
      return;
    }

    if (arrivalAlertShownRef.current) {
      return;
    }

    arrivalAlertShownRef.current = true;

    Alert.alert(
      "¡Llegaste a tu destino!",
      `La simulación finalizó en ${elapsedSeconds} segundos.`,
      [
        {
          text: "Aceptar",
        },
      ]
    );
  }, [elapsedSeconds, isArrived]);

  const handleMainButton = () => {
    if (isNavigating) {
      pauseSimulation();
      return;
    }

    if (isPaused) {
      resumeSimulation();
      return;
    }

    if (isNoRoute || isArrived) {
      resetSimulation();
      return;
    }

    startSimulation();
  };

  const getMainButtonContent = () => {
    if (isNavigating) {
      return {
        text: "Pausar viaje",
        icon: "⏸️",
      };
    }

    if (isPaused) {
      return {
        text: "Continuar viaje",
        icon: "▶️",
      };
    }

    if (isNoRoute || isArrived) {
      return {
        text: "Reiniciar prueba",
        icon: "🔄",
      };
    }

    return {
      text: "Iniciar simulación",
      icon: "▶️",
    };
  };

  const mainButtonContent =
    getMainButtonContent();

  const handleApplyScenarioNow = () => {
    if (selectedScenarioId === "normal") {
      Alert.alert(
        "Viaje normal",
        "Este escenario no contiene incidentes."
      );

      return;
    }

    const result = applyScenario(
      selectedScenarioId
    );

    if (!result?.success) {
      Alert.alert(
        "Sin ruta disponible",
        result?.message ||
          "No se encontró una ruta alternativa."
      );

      return;
    }

    Alert.alert(
      "Evento aplicado",
      result.message ||
        "La ruta fue recalculada."
    );
  };

  const handleTogglePreference = (
    preferenceName
  ) => {
    updatePreferences({
      [preferenceName]:
        !preferences[preferenceName],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Motor de eventos
          </Text>

          <Text style={styles.headerSubtitle}>
            Seguimiento activo y recálculo A*
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>
            🧠
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  statusInformation.color,
              },
            ]}
          />

          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>
              Estado del motor
            </Text>

            <Text style={styles.statusValue}>
              {statusInformation.icon}{" "}
              {statusInformation.label}
            </Text>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>
              {progress}%
            </Text>
          </View>
        </View>

        <View style={styles.routeTitleCard}>
          <View style={styles.routePoint}>
            <View
              style={[
                styles.routeDot,
                styles.originDot,
              ]}
            />

            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>
                Origen
              </Text>

              <Text style={styles.routeValue}>
                {originNode?.name ||
                  "Plaza Murillo"}
              </Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routePoint}>
            <View
              style={[
                styles.routeDot,
                styles.destinationDot,
              ]}
            />

            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>
                Destino
              </Text>

              <Text style={styles.routeValue}>
                {destinationNode?.name ||
                  "Calle 21 de Calacoto"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.mapCard}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={INITIAL_REGION}
          >
            {routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={5}
                strokeColor={
                  mapRoute?.esRutaRecalculada
                    ? "#F97316"
                    : "#2563EB"
                }
              />
            )}

            {originNode && (
              <Marker
                coordinate={{
                  latitude:
                    originNode.latitude,
                  longitude:
                    originNode.longitude,
                }}
                title="Origen"
                description={originNode.name}
                pinColor="#16A34A"
              />
            )}

            {destinationNode && (
              <Marker
                coordinate={{
                  latitude:
                    destinationNode.latitude,
                  longitude:
                    destinationNode.longitude,
                }}
                title="Destino"
                description={
                  destinationNode.name
                }
                pinColor="#DC2626"
              />
            )}

            {activeEvents.map((event) => {
              if (!event.location) {
                return null;
              }

              return (
                <Marker
                  key={event.id}
                  coordinate={{
                    latitude:
                      event.location.latitude,
                    longitude:
                      event.location.longitude,
                  }}
                  title={`${event.icon} ${event.title}`}
                  description={
                    event.description
                  }
                >
                  <View
                    style={[
                      styles.eventMarker,
                      {
                        borderColor:
                          event.color ||
                          "#DC2626",
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.eventMarkerText
                      }
                    >
                      {event.icon}
                    </Text>
                  </View>
                </Marker>
              );
            })}

            {currentPosition && (
              <Marker
                coordinate={
                  currentPosition
                }
                title="Tu ubicación simulada"
                description={
                  currentNode?.name ||
                  "En movimiento"
                }
              >
                <View
                  style={
                    styles.userMarkerOuter
                  }
                >
                  <View
                    style={
                      styles.userMarkerInner
                    }
                  />

                  <View
                    style={
                      styles.userMarkerDirection
                    }
                  />
                </View>
              </Marker>
            )}
          </MapView>

          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendLine,
                  {
                    backgroundColor:
                      mapRoute?.esRutaRecalculada
                        ? "#F97316"
                        : "#2563EB",
                  },
                ]}
              />

              <Text style={styles.legendText}>
                {mapRoute?.esRutaRecalculada
                  ? "Ruta alternativa"
                  : "Ruta inicial"}
              </Text>
            </View>

            <Text style={styles.mapElapsed}>
              ⏱️ {elapsedSeconds}s
            </Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <Text style={styles.sectionMiniTitle}>
            Instrucción actual
          </Text>

          <Text style={styles.instructionText}>
            🧭 {currentInstruction}
          </Text>

          <Text style={styles.currentNodeText}>
            Ubicación aproximada:{" "}
            {currentNode?.name ||
              "Calculando..."}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Casos de simulación
        </Text>

        <Text style={styles.sectionDescription}>
          Selecciona un escenario y luego inicia
          el viaje. El incidente se activará
          automáticamente al 25 % del recorrido.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.scenarioList
          }
        >
          {DEMO_SCENARIOS.map(
            (scenario) => {
              const selected =
                selectedScenarioId ===
                scenario.id;

              return (
                <TouchableOpacity
                  key={scenario.id}
                  style={[
                    styles.scenarioCard,
                    selected &&
                      styles.scenarioCardSelected,
                  ]}
                  onPress={() =>
                    selectScenario(
                      scenario.id
                    )
                  }
                >
                  <Text
                    style={
                      styles.scenarioIcon
                    }
                  >
                    {scenario.icon}
                  </Text>

                  <Text
                    style={[
                      styles.scenarioName,
                      selected &&
                        styles.scenarioNameSelected,
                    ]}
                  >
                    {scenario.name}
                  </Text>

                  <Text
                    style={[
                      styles.scenarioDescription,
                      selected &&
                        styles.scenarioDescriptionSelected,
                    ]}
                  >
                    {scenario.description}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </ScrollView>

        <View style={styles.selectedScenarioCard}>
          <View style={styles.selectedScenarioHeader}>
            <Text style={styles.selectedScenarioIcon}>
              {selectedScenario?.icon ||
                "🧪"}
            </Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.selectedScenarioLabel}>
                Escenario seleccionado
              </Text>

              <Text style={styles.selectedScenarioName}>
                {selectedScenario?.name ||
                  "Viaje normal"}
              </Text>
            </View>

            {isScenarioApplied && (
              <View style={styles.appliedBadge}>
                <Text
                  style={
                    styles.appliedBadgeText
                  }
                >
                  APLICADO
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.applyEventButton}
            onPress={handleApplyScenarioNow}
            disabled={
              selectedScenarioId ===
              "normal"
            }
          >
            <Text
              style={[
                styles.applyEventButtonText,
                selectedScenarioId ===
                  "normal" &&
                  styles.disabledButtonText,
              ]}
            >
              ⚡ Aplicar evento ahora
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Preferencias del algoritmo
        </Text>

        <View style={styles.preferenceGrid}>
          <TouchableOpacity
            style={[
              styles.preferenceButton,
              preferences.fastest &&
                styles.preferenceButtonActive,
            ]}
            onPress={() =>
              handleTogglePreference(
                "fastest"
              )
            }
          >
            <Text style={styles.preferenceIcon}>
              ⚡
            </Text>

            <Text
              style={[
                styles.preferenceText,
                preferences.fastest &&
                  styles.preferenceTextActive,
              ]}
            >
              Más rápida
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.preferenceButton,
              preferences.lowCost &&
                styles.preferenceButtonActive,
            ]}
            onPress={() =>
              handleTogglePreference(
                "lowCost"
              )
            }
          >
            <Text style={styles.preferenceIcon}>
              💰
            </Text>

            <Text
              style={[
                styles.preferenceText,
                preferences.lowCost &&
                  styles.preferenceTextActive,
              ]}
            >
              Más barata
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.preferenceButton,
              preferences.lessWalking &&
                styles.preferenceButtonActive,
            ]}
            onPress={() =>
              handleTogglePreference(
                "lessWalking"
              )
            }
          >
            <Text style={styles.preferenceIcon}>
              🚶
            </Text>

            <Text
              style={[
                styles.preferenceText,
                preferences.lessWalking &&
                  styles.preferenceTextActive,
              ]}
            >
              Menos caminata
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.preferenceButton,
              preferences.safer &&
                styles.preferenceButtonActive,
            ]}
            onPress={() =>
              handleTogglePreference(
                "safer"
              )
            }
          >
            <Text style={styles.preferenceIcon}>
              🛡️
            </Text>

            <Text
              style={[
                styles.preferenceText,
                preferences.safer &&
                  styles.preferenceTextActive,
              ]}
            >
              Más segura
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Resultado del motor
        </Text>

        {isNoRoute ? (
          <View style={styles.noRouteCard}>
            <Text style={styles.noRouteIcon}>
              ⛔
            </Text>

            <Text style={styles.noRouteTitle}>
              No existe una ruta disponible
            </Text>

            <Text
              style={styles.noRouteDescription}
            >
              Todos los accesos conocidos hacia
              el destino están bloqueados.
            </Text>
          </View>
        ) : (
          <View style={styles.metricsCard}>
            <View style={styles.metricItem}>
              <Text style={styles.metricIcon}>
                ⏱️
              </Text>

              <Text style={styles.metricValue}>
                {routeSummary.duracion_total ||
                  0}{" "}
                min
              </Text>

              <Text style={styles.metricLabel}>
                Duración
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricIcon}>
                📏
              </Text>

              <Text style={styles.metricValue}>
                {formatNumber(
                  routeSummary.distancia_total
                )}{" "}
                km
              </Text>

              <Text style={styles.metricLabel}>
                Distancia
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricIcon}>
                💵
              </Text>

              <Text style={styles.metricValue}>
                Bs{" "}
                {formatNumber(
                  routeSummary.costo_estimado
                )}
              </Text>

              <Text style={styles.metricLabel}>
                Costo
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricIcon}>
                🔁
              </Text>

              <Text style={styles.metricValue}>
                {routeSummary.transbordos ||
                  0}
              </Text>

              <Text style={styles.metricLabel}>
                Transbordos
              </Text>
            </View>
          </View>
        )}

        <View style={styles.algorithmCard}>
          <View style={styles.algorithmHeader}>
            <Text style={styles.algorithmTitle}>
              🧠 Métricas técnicas
            </Text>

            <View style={styles.algorithmBadge}>
              <Text
                style={
                  styles.algorithmBadgeText
                }
              >
                A*
              </Text>
            </View>
          </View>

          <View style={styles.algorithmRow}>
            <Text style={styles.algorithmLabel}>
              Nodos explorados
            </Text>

            <Text style={styles.algorithmValue}>
              {metrics.exploredNodesCount ||
                routeSummary.nodos_explorados ||
                0}
            </Text>
          </View>

          <View style={styles.algorithmRow}>
            <Text style={styles.algorithmLabel}>
              Tiempo de cálculo
            </Text>

            <Text style={styles.algorithmValue}>
              {metrics.calculationTimeMs || 0} ms
            </Text>
          </View>

          <View style={styles.algorithmRow}>
            <Text style={styles.algorithmLabel}>
              Vías bloqueadas
            </Text>

            <Text style={styles.algorithmValue}>
              {currentResult?.eventSummary
                ?.blockedCount || 0}
            </Text>
          </View>

          <View style={styles.algorithmRow}>
            <Text style={styles.algorithmLabel}>
              Vías congestionadas
            </Text>

            <Text style={styles.algorithmValue}>
              {currentResult?.eventSummary
                ?.congestedCount || 0}
            </Text>
          </View>

          {comparison?.changed && (
            <View style={styles.routeChangedBox}>
              <Text
                style={
                  styles.routeChangedTitle
                }
              >
                🔄 La ruta fue modificada
              </Text>

              <Text
                style={
                  styles.routeChangedText
                }
              >
                El algoritmo evitó los tramos
                afectados y seleccionó un nuevo
                recorrido.
              </Text>
            </View>
          )}
        </View>

        {activeEvents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Eventos activos
            </Text>

            {activeEvents.map((event) => (
              <View
                key={event.id}
                style={styles.eventCard}
              >
                <View
                  style={[
                    styles.eventIconContainer,
                    {
                      borderColor:
                        event.color ||
                        "#DC2626",
                    },
                  ]}
                >
                  <Text
                    style={styles.eventCardIcon}
                  >
                    {event.icon}
                  </Text>
                </View>

                <View style={styles.eventContent}>
                  <Text
                    style={styles.eventTitle}
                  >
                    {event.title}
                  </Text>

                  <Text
                    style={
                      styles.eventDescription
                    }
                  >
                    {event.description}
                  </Text>

                  <Text
                    style={styles.eventLocation}
                  >
                    📍 {event.location?.name}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity
          style={[
            styles.mainButton,
            isNoRoute &&
              styles.mainButtonReset,
          ]}
          onPress={handleMainButton}
        >
          <Text style={styles.mainButtonIcon}>
            {mainButtonContent.icon}
          </Text>

          <Text style={styles.mainButtonText}>
            {mainButtonContent.text}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetSimulation}
        >
          <Text style={styles.resetButtonText}>
            Reiniciar escenario
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  header: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 21,
    backgroundColor: "#F1F5F9",
  },

  backButtonText: {
    marginTop: -3,
    fontSize: 34,
    lineHeight: 36,
    color: "#0F172A",
  },

  headerTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  headerIcon: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
  },

  headerIconText: {
    fontSize: 22,
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 42,
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  statusIndicator: {
    width: 6,
    height: 48,
    borderRadius: 4,
    marginRight: 13,
  },

  statusContent: {
    flex: 1,
  },

  statusLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  statusValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  progressCircle: {
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 27,
    backgroundColor: "#EFF6FF",
    borderWidth: 3,
    borderColor: "#2563EB",
  },

  progressText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2563EB",
  },

  routeTitleCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  routePoint: {
    flexDirection: "row",
    alignItems: "center",
  },

  routeDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    marginRight: 12,
  },

  originDot: {
    backgroundColor: "#16A34A",
  },

  destinationDot: {
    backgroundColor: "#DC2626",
  },

  routeTextContainer: {
    flex: 1,
  },

  routeLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },

  routeValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  routeDivider: {
    width: 2,
    height: 24,
    marginLeft: 5,
    marginVertical: 4,
    backgroundColor: "#CBD5E1",
  },

  mapCard: {
    height: 390,
    marginTop: 14,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  map: {
    flex: 1,
  },

  mapLegend: {
    position: "absolute",
    right: 12,
    bottom: 12,
    left: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.94)",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendLine: {
    width: 26,
    height: 5,
    marginRight: 8,
    borderRadius: 3,
  },

  legendText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  mapElapsed: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  eventMarker: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 19,
    borderWidth: 3,
    backgroundColor: "#FFFFFF",
  },

  eventMarkerText: {
    fontSize: 20,
  },

  userMarkerOuter: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 19,
    backgroundColor: "rgba(37,99,235,0.24)",
  },

  userMarkerInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#2563EB",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  userMarkerDirection: {
    position: "absolute",
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#2563EB",
  },

  instructionCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  sectionMiniTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#2563EB",
  },

  instructionText: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 23,
    color: "#0F172A",
  },

  currentNodeText: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748B",
  },

  sectionTitle: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },

  sectionDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  scenarioList: {
    paddingTop: 12,
    paddingBottom: 4,
  },

  scenarioCard: {
    width: 168,
    minHeight: 152,
    marginRight: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  scenarioCardSelected: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },

  scenarioIcon: {
    fontSize: 28,
  },

  scenarioName: {
    marginTop: 9,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  scenarioNameSelected: {
    color: "#FFFFFF",
  },

  scenarioDescription: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  scenarioDescriptionSelected: {
    color: "#DBEAFE",
  },

  selectedScenarioCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  selectedScenarioHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  selectedScenarioIcon: {
    marginRight: 12,
    fontSize: 28,
  },

  selectedScenarioLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  selectedScenarioName: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  appliedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
  },

  appliedBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#15803D",
  },

  applyEventButton: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
  },

  applyEventButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#C2410C",
  },

  disabledButtonText: {
    color: "#94A3B8",
  },

  preferenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },

  preferenceButton: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 13,
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  preferenceButtonActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },

  preferenceIcon: {
    marginRight: 8,
    fontSize: 19,
  },

  preferenceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

  preferenceTextActive: {
    color: "#1D4ED8",
  },

  metricsCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
    padding: 8,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  metricItem: {
    width: "50%",
    alignItems: "center",
    paddingVertical: 14,
  },

  metricIcon: {
    fontSize: 21,
  },

  metricValue: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },

  metricLabel: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748B",
  },

  algorithmCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#111827",
  },

  algorithmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  algorithmTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  algorithmBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#7C3AED",
  },

  algorithmBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  algorithmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },

  algorithmLabel: {
    fontSize: 13,
    color: "#CBD5E1",
  },

  algorithmValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  routeChangedBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#1E293B",
  },

  routeChangedTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FDBA74",
  },

  routeChangedText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#CBD5E1",
  },

  noRouteCard: {
    alignItems: "center",
    marginTop: 12,
    padding: 22,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  noRouteIcon: {
    fontSize: 38,
  },

  noRouteTitle: {
    marginTop: 9,
    fontSize: 16,
    fontWeight: "900",
    color: "#991B1B",
  },

  noRouteDescription: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#B91C1C",
  },

  eventCard: {
    flexDirection: "row",
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  eventIconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
  },

  eventCardIcon: {
    fontSize: 24,
  },

  eventContent: {
    flex: 1,
  },

  eventTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
  },

  eventDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  eventLocation: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },

  mainButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#2563EB",
  },

  mainButtonReset: {
    backgroundColor: "#DC2626",
  },

  mainButtonIcon: {
    marginRight: 9,
    fontSize: 20,
  },

  mainButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  resetButton: {
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  resetButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
  },
});