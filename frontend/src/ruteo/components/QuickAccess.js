import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';

const ITEMS = [
    {
        id: 'home',
        icon: 'home',
        title: 'Casa',
        background: COLORS.ANDEAN_BLUE_LIGHT,
        color: COLORS.ANDEAN_BLUE,
    },
    {
        id: 'work',
        icon: 'work',
        title: 'Trabajo',
        background: COLORS.ANDEAN_TERRACOTTA_LIGHT,
        color: COLORS.ANDEAN_TERRACOTTA,
    },
    {
        id: 'favorites',
        icon: 'favorite',
        title: 'Favoritos',
        background: COLORS.ANDEAN_GREEN_LIGHT,
        color: COLORS.ANDEAN_GREEN,
    },
];

export default function QuickAccess() {

    const handlePress = (item) => {
        console.log(item.title);
    };

    return (

        <View style={styles.row}>

            {ITEMS.map(item => (

                <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() => handlePress(item)}
                >

                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: item.background }
                        ]}
                    >
                        <MaterialIcons
                            name={item.icon}
                            size={30}
                            color={item.color}
                        />
                    </View>

                    <Text style={styles.label}>
                        {item.title}
                    </Text>

                </TouchableOpacity>

            ))}

        </View>

    );
}

const styles = StyleSheet.create({

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    card: {
        width: '31%',

        backgroundColor: COLORS.SURFACE,

        borderRadius: 18,

        paddingVertical: 18,

        alignItems: 'center',

        borderWidth: 1,
        borderColor: COLORS.BORDER,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },

    iconContainer: {
        width: 58,
        height: 58,
        borderRadius: 29,

        justifyContent: 'center',
        alignItems: 'center',

        marginBottom: 12,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.TEXT_PRIMARY,
    },

});