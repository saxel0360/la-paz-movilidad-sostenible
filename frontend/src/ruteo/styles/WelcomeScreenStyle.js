import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/typography";

export default StyleSheet.create({

    background: {
        flex: 1,
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.100)",
        zIndex: 1,
    },

    content: {
        flex: 1,
        justifyContent: "space-between",
        paddingTop: 70,
        paddingBottom: 45,
        paddingHorizontal: 30,
    },

    headerContent: {
        alignItems: "center",
    },

    logo: {
        width: 250,
        height: 220,
        marginTop: 40,
    },

    title: {
        fontSize: 23,
        color: "#081D63",
        fontFamily: FONTS.SEMIBOLD,
        textAlign: "center",
        marginTop: 5,
    },

    description: {
        color: "#24376A",
        fontSize: 16,
        textAlign: "center",
        lineHeight: 30,
    },

    loadingContainer: {
        width: "100%",
    },

    loadingText: {
        color: "#24376A",
        textAlign: "center",
        marginBottom: 12,
        fontFamily: FONTS.SEMIBOLD,
    },

    loadingBar: {
        width: "100%",
        height: 8,
        backgroundColor: "#DCE6F7",
        borderRadius: 20,
        overflow: "hidden",
    },

    loadingProgress: {
        height: "100%",
        backgroundColor: COLORS.PRIMARY,
        borderRadius: 20,
    },

});