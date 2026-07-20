import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { TEST_CASES } from '../../services/minibusRoutes';

export default function RecentTrips() {

    const navigation = useNavigation();

    const recentTrips = Object.entries(TEST_CASES)
        .map(([key, item]) => ({
            id: key,
            ...item,
        }));

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
                navigation.navigate('RoutePlanner', {
                    trip: item,
                })
            }
        >

            <View style={styles.row}>
                <Text style={styles.point} numberOfLines={1}>
                    📍 {item.origen.nombre}
                </Text>

                <Text style={styles.arrow}>
                    →
                </Text>

                <Text style={styles.point} numberOfLines={1}>
                    📍 {item.destino.nombre}
                </Text>
            </View>


            <View style={styles.footer}>
                <Text style={styles.mode}>
                    {item.modo}
                </Text>

                <Text style={styles.route}>
                    🚐 {item.ruta_minibus?.replace('ruta_', '')}
                </Text>
            </View>

        </TouchableOpacity>
    );


    return (
        <FlatList
            data={recentTrips}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}

            // Aquí limitas el área visible
            style={styles.list}

            nestedScrollEnabled
        />
    );
}


const styles = StyleSheet.create({

    list: {
        maxHeight: 250, // altura visible de rutas recientes
    },

    card: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,

        borderWidth: 1,
        borderColor: COLORS.GRAY_200,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    point: {
        flex: 1,
        fontSize: 13,
        color: COLORS.GRAY_800,
        fontWeight: '500',
    },

    arrow: {
        marginHorizontal: 8,
        color: COLORS.GRAY_400,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },

    mode: {
        fontSize: 11,
        color: COLORS.PRIMARY,
        fontWeight: '600',
    },

    route: {
        fontSize: 11,
        color: COLORS.GRAY_500,
    },

});