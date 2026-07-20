import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/typography";

export default function RouteCard({ route, onSelectRoute }) {

    return (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => onSelectRoute(route)}
            activeOpacity={0.8}
        >
            {/* CABECERA */}
            {
                route.esRecomendada && (
                    <View style={styles.recommended}>
                        <Text style={styles.recommendedText}>
                            ⭐ Ruta recomendada
                        </Text>
                    </View>
                )
            }

            {/* INFORMACION PRINCIPAL */}
            <View style={styles.summary}>
                <View>
                    <Text style={styles.time}>
                        {route.tiempoEstimado} min
                    </Text>

                    <Text style={styles.label}>
                        Tiempo estimado
                    </Text>
                </View>

                <View>
                    <Text style={styles.cost}>
                        Bs {route.costoTotal.toFixed(2)}
                    </Text>
                    <Text style={styles.label}>
                        Pasaje
                    </Text>
                </View>
            </View>

            {/* PASOS */}
            <View style={styles.steps}>
                {
                    route.pasos.map((step) => (
                        <View
                            key={step.orden}
                            style={styles.step}
                        >
                            <View
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor:
                                            getTransportColor(step.tipoTransporte)
                                    }
                                ]}
                            />

                            <View style={styles.stepContent}>

                                <Text style={styles.stepTitle}>
                                    {step.nombre}
                                </Text>

                                <Text style={styles.description}>
                                    {step.descripcion}
                                </Text>

                                {
                                    step.letrero && (
                                        <Text style={styles.sign}>
                                            🪧 {step.letrero}
                                        </Text>
                                    )
                                }
                            </View>
                        </View>
                    ))
                }
            </View>


            {/* PIE */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    🔄 {route.cantidadTransbordos} transbordos
                </Text>

                <Text style={styles.footerText}>
                    🚶 {route.distanciaCaminando} min caminando
                </Text>
            </View>
        </TouchableOpacity>

    );
}

function getTransportColor(type){

    switch(type){
        case "TELEFERICO":
            return COLORS.TELEFERICO;

        case "PUMAKATARI":
            return COLORS.PUMAKATARI;

        case "MINIBUS":
            return COLORS.MINIBUS;

        case "TRUFI":
            return COLORS.TRUFI;

        case "MICRO":
            return COLORS.MICRO;

        case "CAMINAR":
            return COLORS.WALK;

        default:
            return COLORS.GRAY_500;
    }

}

const styles = StyleSheet.create({
    card:{
        backgroundColor: COLORS.SURFACE,
        borderRadius:24,
        padding:18,
        marginBottom:18,
        borderWidth:1,
        borderColor:COLORS.BORDER,
        elevation:4,
    },

    recommended:{
        backgroundColor:COLORS.ANDEAN_GREEN_LIGHT,
        paddingVertical:6,
        paddingHorizontal:12,
        borderRadius:20,
        alignSelf:"flex-start",
        marginBottom:15,
    },

    recommendedText:{
        color:COLORS.ANDEAN_GREEN,
        fontFamily: FONTS.MEDIUM,
    },

    summary:{
        flexDirection:"row",
        justifyContent:"space-between",
        marginBottom:20,
    },

    time:{
        fontSize:24,
        fontWeight:"900",
        color:COLORS.ANDEAN_BLUE,
    },

    cost:{
        fontSize:24,
        fontWeight:"900",
        color:COLORS.ANDEAN_GREEN,
    },

    label:{
        color:COLORS.TEXT_SECONDARY,
        fontSize:12,
    },

    steps:{
        marginTop:10,
    },

    step:{
        flexDirection:"row",
        marginBottom:15,
    },

    dot:{
        width:14,
        height:14,
        borderRadius:7,
        marginTop:5,
        marginRight:12,
    },

    stepContent:{
        flex:1,
    },

    stepTitle:{
        fontFamily: FONTS.MEDIUM,
        color:COLORS.TEXT_PRIMARY,
        fontSize:15,
    },

    description:{
        color:COLORS.TEXT_SECONDARY,
        marginTop:3,
    },

    sign:{
        marginTop:5,
        color:COLORS.ANDEAN_TERRACOTTA,
        fontFamily: FONTS.MEDIUM,
    },

    footer:{
        marginTop:15,
        paddingTop:12,
        borderTopWidth:1,
        borderTopColor:COLORS.BORDER,
        flexDirection:"row",
        justifyContent:"space-between",
    },

    footerText:{
        color:COLORS.TEXT_SECONDARY,
        fontSize:13,
    },
});