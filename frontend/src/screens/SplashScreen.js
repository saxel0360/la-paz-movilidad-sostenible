import React, { useEffect, useRef } from "react";

import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated
} from "react-native";

import colors from "../theme/colors";


export default function SplashScreen({ navigation }) {


  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;


  const scaleAnim = useRef(
    new Animated.Value(0.7)
  ).current;



  useEffect(()=>{


    Animated.parallel([

      Animated.timing(fadeAnim,{
        toValue:1,
        duration:1200,
        useNativeDriver:true
      }),


      Animated.spring(scaleAnim,{
        toValue:1,
        speed:2,
        bounciness:8,
        useNativeDriver:true
      })

    ]).start();



    const timer = setTimeout(()=>{

      navigation.replace("Home");

    },3500);



    return ()=>clearTimeout(timer);


  },[]);



  return (

    <View style={styles.container}>


      <Animated.View
        style={{
          opacity:fadeAnim,
          transform:[
            {
              scale:scaleAnim
            }
          ]
        }}
      >

        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

      </Animated.View>



      <Animated.Text
        style={[
          styles.title,
          {
            opacity:fadeAnim
          }
        ]}
      >
        Movilidad La Paz
      </Animated.Text>



      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity:fadeAnim
          }
        ]}
      >
        Tu ruta inteligente por la ciudad
      </Animated.Text>



      <View style={styles.loader}>
        <View style={styles.dot}/>
      </View>


    </View>

  );

}



const styles = StyleSheet.create({

container:{

 flex:1,

 backgroundColor:colors.primary,

 justifyContent:"center",

 alignItems:"center"

},



logo:{

 width:180,

 height:180

},



title:{

 marginTop:25,

 fontSize:28,

 fontWeight:"700",

 color:colors.white

},



subtitle:{

 marginTop:8,

 fontSize:16,

 color:colors.white,

 opacity:0.85

},



loader:{

 marginTop:45,

 width:60,

 height:6,

 backgroundColor:"rgba(255,255,255,0.3)",

 borderRadius:10,

 overflow:"hidden"

},



dot:{

 width:20,

 height:6,

 backgroundColor:colors.secondary,

 borderRadius:10

}


});