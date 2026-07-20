export const routes = [
  {
    id: 1,
    origen: "Sopocachi",
    destino: "Plaza Murillo",
    tiempoEstimado: 25,
    costoTotal: 3.5,
    cantidadTransbordos: 0,
    distanciaCaminando: 5,
    tipoRuta: "recomendada",
    transportesUsados: ["MINIBUS"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 5 min hasta la parada de minibuses en Av. 6 de Agosto",
        letrero: null
      },
      {
        orden: 2,
        tipoTransporte: "MINIBUS",
        nombre: "Minibús Línea 4",
        descripcion: "Recorrido por Av. 6 de Agosto hasta Plaza Murillo",
        letrero: "Sopocachi - Plaza Murillo"
      }
    ]
  },
  {
    id: 2,
    origen: "Villa Fátima",
    destino: "Centro",
    tiempoEstimado: 35,
    costoTotal: 4.0,
    cantidadTransbordos: 1,
    distanciaCaminando: 10,
    tipoRuta: "economica",
    transportesUsados: ["MINIBUS", "MINIBUS"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "MINIBUS",
        nombre: "Minibús Línea 12",
        descripcion: "Desde Villa Fátima hasta la Ceja",
        letrero: "Villa Fátima - Ceja"
      },
      {
        orden: 2,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 10 min hasta el punto de transbordo",
        letrero: null
      },
      {
        orden: 3,
        tipoTransporte: "MINIBUS",
        nombre: "Minibús Línea 8",
        descripcion: "Desde la Ceja hasta el Centro",
        letrero: "Ceja - Centro"
      }
    ]
  },
  {
    id: 3,
    origen: "Calacoto",
    destino: "San Pedro",
    tiempoEstimado: 20,
    costoTotal: 5.0,
    cantidadTransbordos: 0,
    distanciaCaminando: 8,
    tipoRuta: "rapida",
    transportesUsados: ["TELEFERICO"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Roja",
        descripcion: "Desde Calacoto hasta San Pedro en teleférico",
        letrero: null
      }
    ]
  },
  {
    id: 4,
    origen: "Obrajes",
    destino: "Prado",
    tiempoEstimado: 30,
    costoTotal: 3.0,
    cantidadTransbordos: 0,
    distanciaCaminando: 15,
    tipoRuta: "menosTransbordos",
    transportesUsados: ["TRUFI"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 15 min hasta la parada de trufi",
        letrero: null
      },
      {
        orden: 2,
        tipoTransporte: "TRUFI",
        nombre: "Trufi Obrajes",
        descripcion: "Ruta directa desde Obrajes hasta el Prado",
        letrero: "Obrajes - Prado"
      }
    ]
  },
  {
    id: 5,
    origen: "El Alto",
    destino: "Miraflores",
    tiempoEstimado: 40,
    costoTotal: 4.5,
    cantidadTransbordos: 1,
    distanciaCaminando: 7,
    tipoRuta: "recomendada",
    transportesUsados: ["TELEFERICO", "MICRO"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Roja",
        descripcion: "Desde El Alto hasta Villa Copacabana",
        letrero: null
      },
      {
        orden: 2,
        tipoTransporte: "MICRO",
        nombre: "Micro Línea 44",
        descripcion: "Desde Villa Copacabana hasta Miraflores",
        letrero: "Villa Copacabana - Miraflores"
      }
    ]
  },
  {
    id: 6,
    origen: "Achumani",
    destino: "Centro",
    tiempoEstimado: 45,
    costoTotal: 4.0,
    cantidadTransbordos: 1,
    distanciaCaminando: 12,
    tipoRuta: "economica",
    transportesUsados: ["MINIBUS", "TELEFERICO"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "MINIBUS",
        nombre: "Minibús Línea 7",
        descripcion: "Desde Achumani hasta Calacoto",
        letrero: "Achumani - Calacoto"
      },
      {
        orden: 2,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 12 min hasta la estación de teleférico",
        letrero: null
      },
      {
        orden: 3,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Celeste",
        descripcion: "Desde Calacoto hasta el Centro",
        letrero: null
      }
    ]
  },
  {
    id: 7,
    origen: "San Pedro",
    destino: "Zona Sur",
    tiempoEstimado: 35,
    costoTotal: 6.0,
    cantidadTransbordos: 0,
    distanciaCaminando: 5,
    tipoRuta: "rapida",
    transportesUsados: ["PUMAKATARI"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "PUMAKATARI",
        nombre: "Pumakatari Línea Plateada",
        descripcion: "Desde San Pedro hasta Zona Sur en Pumakatari",
        letrero: null
      }
    ]
  },
  {
    id: 8,
    origen: "Ceja",
    destino: "Plaza Murillo",
    tiempoEstimado: 30,
    costoTotal: 3.5,
    cantidadTransbordos: 0,
    distanciaCaminando: 10,
    tipoRuta: "menosTransbordos",
    transportesUsados: ["TRUFI"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "TRUFI",
        nombre: "Trufi Ceja",
        descripcion: "Ruta directa desde la Ceja hasta Plaza Murillo",
        letrero: "Ceja - Plaza Murillo"
      }
    ]
  },
  {
    id: 9,
    origen: "Chasquipampa",
    destino: "Calacoto",
    tiempoEstimado: 25,
    costoTotal: 3.0,
    cantidadTransbordos: 0,
    distanciaCaminando: 8,
    tipoRuta: "economica",
    transportesUsados: ["MINIBUS"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "MINIBUS",
        nombre: "Minibús Línea 15",
        descripcion: "Desde Chasquipampa hasta Calacoto",
        letrero: "Chasquipampa - Calacoto"
      }
    ]
  },
  {
    id: 10,
    origen: "Pampahasi",
    destino: "Obrajes",
    tiempoEstimado: 50,
    costoTotal: 5.5,
    cantidadTransbordos: 2,
    distanciaCaminando: 15,
    tipoRuta: "recomendada",
    transportesUsados: ["TELEFERICO", "MICRO", "TRUFI"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Naranja",
        descripcion: "Desde Pampahasi hasta Miraflores",
        letrero: null
      },
      {
        orden: 2,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 15 min hasta el punto de transbordo",
        letrero: null
      },
      {
        orden: 3,
        tipoTransporte: "MICRO",
        nombre: "Micro Línea 21",
        descripcion: "Desde Miraflores hasta Sopocachi",
        letrero: "Miraflores - Sopocachi"
      },
      {
        orden: 4,
        tipoTransporte: "TRUFI",
        nombre: "Trufi Sopocachi",
        descripcion: "Desde Sopocachi hasta Obrajes",
        letrero: "Sopocachi - Obrajes"
      }
    ]
  },
  {
    id: 11,
    origen: "Miraflores",
    destino: "El Alto",
    tiempoEstimado: 45,
    costoTotal: 4.0,
    cantidadTransbordos: 1,
    distanciaCaminando: 5,
    tipoRuta: "rapida",
    transportesUsados: ["TELEFERICO"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Amarilla",
        descripcion: "Desde Miraflores hasta El Alto",
        letrero: null
      }
    ]
  },
  {
    id: 12,
    origen: "Sopocachi",
    destino: "Villa Fátima",
    tiempoEstimado: 40,
    costoTotal: 5.0,
    cantidadTransbordos: 0,
    distanciaCaminando: 20,
    tipoRuta: "menosTransbordos",
    transportesUsados: ["TELEFERICO"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 20 min hasta la estación de teleférico",
        letrero: null
      },
      {
        orden: 2,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Verde",
        descripcion: "Desde Sopocachi hasta Villa Fátima",
        letrero: null
      }
    ]
  },
  {
    id: 13,
    origen: "Zona Sur",
    destino: "San Pedro",
    tiempoEstimado: 35,
    costoTotal: 3.5,
    cantidadTransbordos: 1,
    distanciaCaminando: 10,
    tipoRuta: "economica",
    transportesUsados: ["MINIBUS", "TRUFI"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "MINIBUS",
        nombre: "Minibús Línea 3",
        descripcion: "Desde Zona Sur hasta Calacoto",
        letrero: "Zona Sur - Calacoto"
      },
      {
        orden: 2,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 10 min hasta el punto de transbordo",
        letrero: null
      },
      {
        orden: 3,
        tipoTransporte: "TRUFI",
        nombre: "Trufi Calacoto",
        descripcion: "Desde Calacoto hasta San Pedro",
        letrero: "Calacoto - San Pedro"
      }
    ]
  },
  {
    id: 14,
    origen: "Centro",
    destino: "Achumani",
    tiempoEstimado: 55,
    costoTotal: 6.5,
    cantidadTransbordos: 1,
    distanciaCaminando: 15,
    tipoRuta: "recomendada",
    transportesUsados: ["PUMAKATARI", "MINIBUS"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "PUMAKATARI",
        nombre: "Pumakatari Línea Dorada",
        descripcion: "Desde el Centro hasta Calacoto",
        letrero: null
      },
      {
        orden: 2,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 15 min hasta el punto de transbordo",
        letrero: null
      },
      {
        orden: 3,
        tipoTransporte: "MINIBUS",
        nombre: "Minibús Línea 10",
        descripcion: "Desde Calacoto hasta Achumani",
        letrero: "Calacoto - Achumani"
      }
    ]
  },
  {
    id: 15,
    origen: "Obrajes",
    destino: "El Alto",
    tiempoEstimado: 50,
    costoTotal: 5.0,
    cantidadTransbordos: 2,
    distanciaCaminando: 20,
    tipoRuta: "rapida",
    transportesUsados: ["TRUFI", "TELEFERICO"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 20 min hasta la parada de trufi",
        letrero: null
      },
      {
        orden: 2,
        tipoTransporte: "TRUFI",
        nombre: "Trufi Obrajes",
        descripcion: "Desde Obrajes hasta San Pedro",
        letrero: "Obrajes - San Pedro"
      },
      {
        orden: 3,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Roja",
        descripcion: "Desde San Pedro hasta El Alto",
        letrero: null
      }
    ]
  },
  {
    id: 16,
    origen: "Calacoto",
    destino: "Plaza Murillo",
    tiempoEstimado: 30,
    costoTotal: 4.5,
    cantidadTransbordos: 0,
    distanciaCaminando: 7,
    tipoRuta: "menosTransbordos",
    transportesUsados: ["TELEFERICO"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Celeste",
        descripcion: "Desde Calacoto hasta Plaza Murillo",
        letrero: null
      }
    ]
  },
  {
    id: 17,
    origen: "San Pedro",
    destino: "Miraflores",
    tiempoEstimado: 25,
    costoTotal: 3.0,
    cantidadTransbordos: 0,
    distanciaCaminando: 12,
    tipoRuta: "economica",
    transportesUsados: ["MINIBUS"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "MINIBUS",
        nombre: "Minibús Línea 5",
        descripcion: "Desde San Pedro hasta Miraflores",
        letrero: "San Pedro - Miraflores"
      }
    ]
  },
  {
    id: 18,
    origen: "El Alto",
    destino: "Zona Sur",
    tiempoEstimado: 60,
    costoTotal: 7.0,
    cantidadTransbordos: 2,
    distanciaCaminando: 25,
    tipoRuta: "recomendada",
    transportesUsados: ["TELEFERICO", "MICRO", "PUMAKATARI"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Roja",
        descripcion: "Desde El Alto hasta San Pedro",
        letrero: null
      },
      {
        orden: 2,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 25 min hasta el punto de transbordo",
        letrero: null
      },
      {
        orden: 3,
        tipoTransporte: "MICRO",
        nombre: "Micro Línea 33",
        descripcion: "Desde San Pedro hasta Calacoto",
        letrero: "San Pedro - Calacoto"
      },
      {
        orden: 4,
        tipoTransporte: "PUMAKATARI",
        nombre: "Pumakatari Línea Plateada",
        descripcion: "Desde Calacoto hasta Zona Sur",
        letrero: null
      }
    ]
  },
  {
    id: 19,
    origen: "Villa Fátima",
    destino: "Zona Sur",
    tiempoEstimado: 55,
    costoTotal: 6.0,
    cantidadTransbordos: 2,
    distanciaCaminando: 5,
    tipoRuta: "rapida",
    transportesUsados: ["TELEFERICO", "TELEFERICO"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Verde",
        descripcion: "Desde Villa Fátima hasta San Pedro",
        letrero: null
      },
      {
        orden: 2,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Roja",
        descripcion: "Desde San Pedro hasta Zona Sur",
        letrero: null
      }
    ]
  },
  {
    id: 20,
    origen: "Pampahasi",
    destino: "Centro",
    tiempoEstimado: 35,
    costoTotal: 4.5,
    cantidadTransbordos: 1,
    distanciaCaminando: 18,
    tipoRuta: "economica",
    transportesUsados: ["MICRO", "TRUFI"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "MICRO",
        nombre: "Micro Línea 12",
        descripcion: "Desde Pampahasi hasta Miraflores",
        letrero: "Pampahasi - Miraflores"
      },
      {
        orden: 2,
        tipoTransporte: "CAMINAR",
        nombre: "Caminata",
        descripcion: "Camina 18 min hasta el punto de transbordo",
        letrero: null
      },
      {
        orden: 3,
        tipoTransporte: "TRUFI",
        nombre: "Trufi Miraflores",
        descripcion: "Desde Miraflores hasta el Centro",
        letrero: "Miraflores - Centro"
      }
    ]
  },
  {
    id: 21,
    origen: "Chasquipampa",
    destino: "Plaza Murillo",
    tiempoEstimado: 40,
    costoTotal: 5.5,
    cantidadTransbordos: 1,
    distanciaCaminando: 5,
    tipoRuta: "menosTransbordos",
    transportesUsados: ["MINIBUS", "TELEFERICO"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "MINIBUS",
        nombre: "Minibús Línea 15",
        descripcion: "Desde Chasquipampa hasta Calacoto",
        letrero: "Chasquipampa - Calacoto"
      },
      {
        orden: 2,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Celeste",
        descripcion: "Desde Calacoto hasta Plaza Murillo",
        letrero: null
      }
    ]
  },
  {
    id: 22,
    origen: "Zona Sur",
    destino: "Obrajes",
    tiempoEstimado: 20,
    costoTotal: 2.5,
    cantidadTransbordos: 0,
    distanciaCaminando: 5,
    tipoRuta: "rapida",
    transportesUsados: ["TRUFI"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "TRUFI",
        nombre: "Trufi Zona Sur",
        descripcion: "Ruta directa desde Zona Sur hasta Obrajes",
        letrero: "Zona Sur - Obrajes"
      }
    ]
  },
  {
    id: 23,
    origen: "Ceja",
    destino: "El Alto",
    tiempoEstimado: 15,
    costoTotal: 2.0,
    cantidadTransbordos: 0,
    distanciaCaminando: 5,
    tipoRuta: "economica",
    transportesUsados: ["MINIBUS"],
    esRecomendada: false,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "MINIBUS",
        nombre: "Minibús Línea 2",
        descripcion: "Desde la Ceja hasta El Alto",
        letrero: "Ceja - El Alto"
      }
    ]
  },
  {
    id: 24,
    origen: "Miraflores",
    destino: "San Pedro",
    tiempoEstimado: 20,
    costoTotal: 4.0,
    cantidadTransbordos: 1,
    distanciaCaminando: 0,
    tipoRuta: "recomendada",
    transportesUsados: ["TELEFERICO", "TELEFERICO"],
    esRecomendada: true,
    pasos: [
      {
        orden: 1,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Amarilla",
        descripcion: "Desde Miraflores hasta Villa Copacabana",
        letrero: null
      },
      {
        orden: 2,
        tipoTransporte: "TELEFERICO",
        nombre: "Línea Roja",
        descripcion: "Desde Villa Copacabana hasta San Pedro",
        letrero: null
      }
    ]
  }
];