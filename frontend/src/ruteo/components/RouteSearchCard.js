
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import { SearchBar } from './SearchBar';
import React, { useState } from "react";

export default function RouteSearchCard({ onSearch }) {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");

    const handleDestination = (place) => {
        console.log('Destino:', place);

        const shortName =
            place.direccion?.square ||
            place.direccion?.suburb ||
            place.direccion?.neighbourhood ||
            place.nombre.split(",")[0];

        setDestination(shortName);
    };


    const handleLocation = () => {
        console.log('Obtener ubicación actual');
    };

    return (

        <View style={styles.card}>


            {/* ORIGEN */}
            <View style={styles.destination}>
                <SearchBar
                    value={origin}
                    onChangeText={setOrigin}
                    placeholder="¿Dónde estás?"
                    onPlaceSelect={handleDestination}
                />
            </View>

            {/* DESTINO */}

            <View style={styles.destination}>
                <SearchBar
                    placeholder="¿A dónde quieres ir?"
                    onPlaceSelect={handleDestination}
                />
            </View>

            {/* UBICACION ACTUAL */}

            <View style={styles.actions}>

                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={handleLocation}
                >
                    <Text style={styles.locationIcon}>◎</Text>
                    <Text style={styles.locationText}>
                        Mi ubicación
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => {
                        console.log("Botón buscar presionado");
                        console.log("Destino actual:", destination);

                        if (destination.trim()) {
                            onSearch(destination);
                        } else {
                            console.log("Destino vacío");
                        }
                    }}
                >
                    <Text style={styles.searchButtonText}>
                        Buscar ruta
                    </Text>
                </TouchableOpacity>

            </View>


        </View>

    );
}



const styles = StyleSheet.create({

    card: {

        backgroundColor: COLORS.SURFACE,

        borderRadius: 24,

        padding: 18,

        borderWidth: 1,
        borderColor: COLORS.BORDER,


        shadowColor: COLORS.SHADOW,

        shadowOffset:{
            width:0,
            height:5,
        },

        shadowOpacity:0.12,

        shadowRadius:10,

        elevation:5,

    },


    locationBox:{
        flexDirection:'row',
        alignItems:'center',
        paddingBottom:15,
    },


    icon:{
        fontSize:24,
        marginRight:12,
    },


    label:{
        fontSize:12,
        color:COLORS.TEXT_SECONDARY,
    },


    locationText:{
        marginTop:3,
        fontSize:16,
        fontWeight:'600',
        color:COLORS.TEXT_PRIMARY,
    },

    destination:{
        marginTop:10,
    },


    currentButton:{

        flexDirection:'row',

        alignItems:'center',

        marginTop:18,

        backgroundColor:COLORS.ANDEAN_GREEN_LIGHT,

        padding:12,

        borderRadius:14,

    },


    currentIcon:{
        color:COLORS.ANDEAN_GREEN,
        fontSize:20,
        marginRight:10,
    },


    currentText:{
        color:COLORS.ANDEAN_GREEN,
        fontWeight:'600',
    },

    actions: {
        flexDirection: 'row',
        marginTop: 18,
        gap: 10,
    },

    locationButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: COLORS.ANDEAN_GREEN_LIGHT,

        paddingVertical: 14,
        borderRadius: 14,
    },

    locationIcon: {
        color: COLORS.ANDEAN_GREEN,
        fontSize: 18,
        marginRight: 8,
    },

    locationText: {
        color: COLORS.ANDEAN_GREEN,
        fontWeight: '600',
    },

    searchButton: {
        flex: 1,

        backgroundColor: COLORS.ANDEAN_BLUE,

        justifyContent: 'center',
        alignItems: 'center',

        paddingVertical: 14,
        borderRadius: 14,
    },

    searchButtonText: {
        color: COLORS.WHITE,
        fontWeight: '700',
        fontSize: 16,
    },


});