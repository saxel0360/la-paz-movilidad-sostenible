import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';

const { height, width } = Dimensions.get('window');

export const styles = StyleSheet.create({
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
    // Agregar estos estilos nuevos
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerPin: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    markerOriginPin: {
        backgroundColor: COLORS.SUCCESS,
    },
    markerDestinationPin: {
        backgroundColor: COLORS.ERROR,
    },
    markerWaypointPin: {
        backgroundColor: COLORS.PRIMARY,
    },
    markerEmojiText: {
        fontSize: 20,
    },
    markerLabelContainer: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 4,
    },
    markerLabelText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    stepTypeBadge: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.WHITE,
        backgroundColor: COLORS.GRAY_500,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    stepParadasContainer: {
        marginTop: 3,
    },
    stepParadasLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.GRAY_500,
    },
    stepParadasText: {
        fontSize: 10,
        color: COLORS.GRAY_600,
        marginTop: 1,
    },
    simulationControls: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_200,
    },
    simulationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.GRAY_700,
        marginBottom: 6,
    },
    simulationButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    simButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    simButtonBlock: {
        backgroundColor: COLORS.ERROR,
    },
    simButtonClear: {
        backgroundColor: COLORS.SUCCESS,
    },
    simButtonText: {
        color: COLORS.WHITE,
        fontWeight: '600',
        fontSize: 13,
    },
    recalculatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        padding: 8,
        backgroundColor: COLORS.WARNING + '20',
        borderRadius: 8,
    },
    recalculatingText: {
        marginLeft: 8,
        fontSize: 13,
        color: COLORS.GRAY_700,
    },
    blockInfo: {
        marginTop: 8,
        padding: 10,
        backgroundColor: COLORS.ERROR + '10',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.ERROR,
    },
    blockText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.ERROR,
    },
    blockDesc: {
        fontSize: 12,
        color: COLORS.GRAY_600,
        marginTop: 2,
    },
    // Controles de simulación de viaje
    tripControls: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_200,
    },
    tripButton: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: COLORS.PRIMARY,
    },
    tripButtonStart: {
        backgroundColor: COLORS.PRIMARY,
    },
    tripButtonText: {
        color: COLORS.WHITE,
        fontSize: 14,
        fontWeight: 'bold',
    },
    tripStatus: {
        marginTop: 8,
        padding: 10,
        backgroundColor: COLORS.GRAY_100,
        borderRadius: 10,
    },
    tripProgress: {
        height: 8,
        backgroundColor: COLORS.GRAY_300,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
    },
    tripProgressFill: {
        height: '100%',
        backgroundColor: COLORS.PRIMARY,
        borderRadius: 4,
    },
    tripProgressText: {
        position: 'absolute',
        right: 0,
        top: -16,
        fontSize: 10,
        color: COLORS.GRAY_500,
        fontWeight: '600',
    },
    tripInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
        flexWrap: 'wrap',
    },
    tripInfoText: {
        fontSize: 11,
        color: COLORS.GRAY_600,
        marginRight: 4,
        maxWidth: '40%',
    },
    tripControlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 6,
        gap: 6,
    },
    tripControlBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        flex: 1,
        alignItems: 'center',
    },
    tripPauseBtn: {
        backgroundColor: COLORS.WARNING,
    },
    tripResumeBtn: {
        backgroundColor: COLORS.PRIMARY,
    },
    tripStopBtn: {
        backgroundColor: COLORS.ERROR,
    },
    tripControlText: {
        color: COLORS.WHITE,
        fontSize: 12,
        fontWeight: '600',
    },
});

export default styles;