import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import colors from "../theme/colors";
import typography from "../theme/typography";
import spacing from "../theme/spacing";


export default function HomeScreen() {

  return (

    <View style={styles.container}>

      {/* Encabezado */}
      <Text style={styles.title}>
        ¿QUE TOMO?
      </Text>

      <Text style={styles.subtitle}>
        Planifica tu ruta inteligente
      </Text>


      {/* Buscador */}
      <TextInput
        style={styles.search}
        placeholder="¿A dónde quieres ir?"
        placeholderTextColor={colors.textSecondary}
      />


      {/* Sección transporte */}
      <Text style={styles.sectionTitle}>
        Transporte
      </Text>


      <View style={styles.transportContainer}>


        <TouchableOpacity style={styles.card}>
          <Text style={styles.icon}>🚡</Text>
          <Text style={styles.cardText}>
            Teleférico
          </Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.card}>
          <Text style={styles.icon}>🚌</Text>
          <Text style={styles.cardText}>
            PumaKatari
          </Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.card}>
          <Text style={styles.icon}>🚐</Text>
          <Text style={styles.cardText}>
            Minibús
          </Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.card}>
          <Text style={styles.icon}>🚖</Text>
          <Text style={styles.cardText}>
            Trufi
          </Text>
        </TouchableOpacity>


      </View>


      {/* Zona mapa */}
      <View style={styles.map}>

        <Text style={styles.mapText}>
          Mapa de La Paz
        </Text>

      </View>


    </View>

  );
}



const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:colors.background,
    padding:spacing.lg
  },


  title:{
    ...typography.title,
    color:colors.text,
    marginTop:spacing.lg
  },


  subtitle:{
    ...typography.subtitle,
    color:colors.textSecondary,
    marginTop:spacing.sm,
    marginBottom:spacing.lg
  },


  search:{
    backgroundColor:colors.card,
    borderColor:colors.border,
    borderWidth:1,
    borderRadius:12,

    padding:spacing.md,

    color:colors.text,

    marginBottom:spacing.lg
  },


  sectionTitle:{
    ...typography.title,

    fontSize:20,

    color:colors.text,

    marginBottom:spacing.md
  },


  transportContainer:{
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"space-between"
  },


  card:{
    width:"48%",

    backgroundColor:colors.card,

    borderRadius:15,

    padding:spacing.lg,

    alignItems:"center",

    marginBottom:spacing.md
  },


  icon:{
    fontSize:35,

    marginBottom:spacing.sm
  },


  cardText:{
    ...typography.body,

    color:colors.text
  },


  map:{
    flex:1,

    backgroundColor:colors.map,

    borderRadius:20,

    justifyContent:"center",

    alignItems:"center",

    marginTop:spacing.md
  },


  mapText:{
    ...typography.body,

    color:colors.textSecondary
  }


});