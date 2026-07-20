import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/typography";

export default StyleSheet.create({

    container:{
        flex:1,
        backgroundColor: COLORS.BACKGROUND,
        paddingVertical:25,
        paddingHorizontal: 10,
    },

    header:{
        marginTop:25,
    },

    title:{
        fontSize:18,
        color:COLORS.TEXT_SECONDARY,
        fontFamily: FONTS.MEDIUM,
    },

    destination:{
        marginTop:6,
        fontSize:28,
        fontWeight:"900",
        color:COLORS.ANDEAN_BLUE,
    },

    subtitle:{
        marginTop:12,
        fontSize:15,
        color:COLORS.TEXT_SECONDARY,
        lineHeight:22,
    },

    filtersContainer:{
        marginTop:20,
    },

    filterSection:{
        marginTop:10,
    },


    filterTitle:{
        fontSize:13,
        fontFamily: FONTS.SEMINBOLD,
        textTransform:"uppercase",
        letterSpacing:1,
        color:COLORS.TEXT_SECONDARY,
        marginBottom:12,
    },


    filterRow:{
        marginBottom:10,
    },


    filter:{
        backgroundColor:COLORS.SURFACE,
        borderWidth:1,
        borderColor:COLORS.BORDER,
        paddingHorizontal:16,
        paddingVertical:10,
        borderRadius:20,
        marginRight:10,
    },


    filterActive:{
        backgroundColor:COLORS.ANDEAN_BLUE,
        paddingHorizontal:18,
        paddingVertical:10,
        borderRadius:20,
        marginRight:10,
    },


    filterText:{
        color:COLORS.TEXT_PRIMARY,
        fontFamily: FONTS.MEDIUM,
    },

    filterActiveText:{
        color:COLORS.WHITE,
        fontFamily: FONTS.SEMINBOLD,
    },

    routesCount:{
        marginTop:6,
        color:COLORS.TEXT_SECONDARY,
        fontSize:14,
        fontWeight:"600",
    },
});