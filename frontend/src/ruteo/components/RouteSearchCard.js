
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import { SearchBar } from './SearchBar';
import React, { useState } from "react";



export default function RouteSearchCard() {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");

    const handleDestination = (place) => {
        console.log('Destino:', place);
    };


    const handleLocation = () => {
        console.log('Obtener ubicación actual');
    };


    const swapLocations = () => {
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
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

            <TouchableOpacity
                style={styles.currentButton}
                onPress={handleLocation}
            >

                <Text style={styles.currentIcon}>
                    ◎
                </Text>

                <Text style={styles.currentText}>
                    Usar mi ubicación actual
                </Text>

            </TouchableOpacity>


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


    swapButton:{

        position:'absolute',

        right:25,
        top:55,

        width:42,
        height:42,

        borderRadius:21,

        backgroundColor:COLORS.ANDEAN_BLUE,

        justifyContent:'center',
        alignItems:'center',

        zIndex:10,

    },


    swapIcon:{
        color:COLORS.WHITE,
        fontSize:22,
        fontWeight:'bold',
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


});