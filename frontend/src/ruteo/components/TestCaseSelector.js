import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { TEST_CASES } from '../../services/minibusRoutes';

const { height } = Dimensions.get('window');

export const TestCaseSelector = ({ onSelect, selectedCase }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const testCaseList = Object.entries(TEST_CASES).map(([key, value]) => ({
        id: key,
        ...value,
    }));

    const handleSelect = (testCase) => {
        setModalVisible(false);
        if (onSelect) {
            onSelect(testCase);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.testCaseItem,
                selectedCase?.id === item.id && styles.testCaseItemSelected,
            ]}
            onPress={() => handleSelect(item)}
        >
            <View style={styles.testCaseHeader}>
                <Text style={styles.testCaseName}>{item.nombre}</Text>
                <View style={[styles.modoBadge, { backgroundColor: getModoColor(item.modo) }]}>
                    <Text style={styles.modoBadgeText}>{item.modo}</Text>
                </View>
            </View>
            <Text style={styles.testCaseDescription}>{item.descripcion}</Text>
            <View style={styles.testCaseRoute}>
                <Text style={styles.routePoint}>📍 {item.origen.nombre}</Text>
                <Text style={styles.routeArrow}>→</Text>
                <Text style={styles.routePoint}>📍 {item.destino.nombre}</Text>
            </View>
            <Text style={styles.testCaseMeta}>🚐 Ruta {item.ruta_minibus ? item.ruta_minibus.replace('ruta_', ''): '' }</Text>
        </TouchableOpacity>
    );

    const getModoColor = (modo) => {
        const colors = {
            ESTUDIANTE: '#34C759',
            TRABAJADOR: '#007AFF',
            TURISTA: '#AF52DE',
            TELEFERICO_MORADO: '#9B59B6',
            TELEFERICO_AMARILLO: '#F1C40F',
            COMBINADO: '#E74C3C',
        };
        return colors[modo] || COLORS.GRAY_500;
    };

    return (
        <>
            {/* Botón para abrir selector */}
            <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <Text style={styles.selectorButtonText}>
                    📋 {selectedCase ? selectedCase.nombre : 'Seleccionar caso de prueba'}
                </Text>
                <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>

            {/* Modal con lista de casos */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>📋 Casos de prueba</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={testCaseList}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />

                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => {
                                setModalVisible(false);
                                if (onSelect) onSelect(null);
                            }}
                        >
                            <Text style={styles.clearButtonText}>Limpiar selección</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.WHITE,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.GRAY_200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        marginBottom: 8,
    },
    selectorButtonText: {
        fontSize: 14,
        color: COLORS.GRAY_700,
        flex: 1,
    },
    selectorArrow: {
        fontSize: 12,
        color: COLORS.GRAY_500,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.WHITE,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        maxHeight: height * 0.7,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_200,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.GRAY_900,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.GRAY_100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: COLORS.GRAY_500,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 8,
    },
    testCaseItem: {
        padding: 14,
        borderRadius: 12,
        backgroundColor: COLORS.GRAY_100,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    testCaseItemSelected: {
        borderColor: COLORS.PRIMARY,
        backgroundColor: COLORS.PRIMARY + '10',
    },
    testCaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    testCaseName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.GRAY_900,
        flex: 1,
    },
    modoBadge: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
    },
    modoBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.WHITE,
    },
    testCaseDescription: {
        fontSize: 12,
        color: COLORS.GRAY_600,
        marginBottom: 6,
    },
    testCaseRoute: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    routePoint: {
        fontSize: 12,
        color: COLORS.GRAY_700,
        fontWeight: '500',
        flex: 1,
    },
    routeArrow: {
        fontSize: 16,
        color: COLORS.GRAY_400,
        marginHorizontal: 8,
    },
    testCaseMeta: {
        fontSize: 11,
        color: COLORS.GRAY_500,
    },
    clearButton: {
        marginTop: 8,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: COLORS.GRAY_100,
        borderRadius: 10,
    },
    clearButtonText: {
        fontSize: 14,
        color: COLORS.GRAY_500,
        fontWeight: '500',
    },
});