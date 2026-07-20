const SMART_STOPS = [
  {
    id: 1,
    nombre: "Plaza Murillo",
    estado: "Operando",
    color: "#4CAF50",
    ocupacion: 35,
    accesible: true,
    actualizacion: "Hace 1 min",
    lineas: [
      {
        nombre: "Minibús 22",
        tiempo: "3 min",
      },
      {
        nombre: "Minibús 44",
        tiempo: "6 min",
      },
      {
        nombre: "Teleférico",
        tiempo: "5 min",
      },
    ],
  },

  {
    id: 2,
    nombre: "Prado",
    estado: "Congestionada",
    color: "#F59E0B",
    ocupacion: 72,
    accesible: true,
    actualizacion: "Hace 3 min",
    lineas: [
      {
        nombre: "PumaKatari",
        tiempo: "8 min",
      },
      {
        nombre: "Minibús 47",
        tiempo: "12 min",
      },
    ],
  },

  {
    id: 3,
    nombre: "Ceja",
    estado: "Saturada",
    color: "#EF4444",
    ocupacion: 96,
    accesible: false,
    actualizacion: "Hace 30 seg",
    lineas: [
      {
        nombre: "Minibús 212",
        tiempo: "15 min",
      },
      {
        nombre: "Trufi",
        tiempo: "9 min",
      },
    ],
  },

  {
    id: 4,
    nombre: "Obrajes",
    estado: "Operando",
    color: "#4CAF50",
    ocupacion: 40,
    accesible: true,
    actualizacion: "Hace 2 min",
    lineas: [
      {
        nombre: "PumaKatari",
        tiempo: "4 min",
      },
      {
        nombre: "Minibús 11",
        tiempo: "7 min",
      },
    ],
  },

  {
    id: 5,
    nombre: "Miraflores",
    estado: "Congestionada",
    color: "#F59E0B",
    ocupacion: 68,
    accesible: true,
    actualizacion: "Hace 5 min",
    lineas: [
      {
        nombre: "Teleférico",
        tiempo: "6 min",
      },
      {
        nombre: "Minibús 33",
        tiempo: "10 min",
      },
    ],
  },
];

export default SMART_STOPS;