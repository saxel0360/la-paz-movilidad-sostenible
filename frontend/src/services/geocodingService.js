import axios from 'axios';

// Usamos Nominatim de OpenStreetMap (gratuito, sin API key)
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export const geocodingService = {
    /**
     * Busca lugares por texto
     * @param {string} query - Texto a buscar (ej: "Plaza Murillo, La Paz")
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<Array>} Lista de resultados
     */
    searchPlaces: async (query, options = {}) => {
        try {
            const response = await axios.get(`${NOMINATIM_URL}/search`, {
                params: {
                    q: query,
                    format: 'json',
                    limit: 10,
                    addressdetails: 1,
                    'bounded': 1,
                    viewbox: '-68.15,-16.45,-68.10,-16.55', // Enfocar en La Paz
                    ...options
                },
                headers: {
                    'User-Agent': 'LaPazMovilidadApp/1.0' // Requerido por Nominatim
                }
            });

            return response.data.map(item => ({
                id: item.place_id,
                nombre: item.display_name,
                latitud: parseFloat(item.lat),
                longitud: parseFloat(item.lon),
                tipo: item.type,
                categoria: item.category,
                direccion: item.address,
                coordenadas: {
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon)
                }
            }));
        } catch (error) {
            console.error('Error en búsqueda de lugares:', error);
            throw error;
        }
    },

    /**
     * Obtiene dirección desde coordenadas (Reverse Geocoding)
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     * @returns {Promise<Object>} Información del lugar
     */
    reverseGeocode: async (lat, lng) => {
        try {
            const response = await axios.get(`${NOMINATIM_URL}/reverse`, {
                params: {
                    lat: lat,
                    lon: lng,
                    format: 'json',
                    addressdetails: 1,
                    zoom: 18
                },
                headers: {
                    'User-Agent': 'LaPazMovilidadApp/1.0'
                }
            });

            const data = response.data;
            return {
                id: data.place_id,
                nombre: data.display_name || 'Ubicación seleccionada',
                latitud: parseFloat(data.lat),
                longitud: parseFloat(data.lon),
                direccion: data.address,
                coordenadas: {
                    latitude: parseFloat(data.lat),
                    longitude: parseFloat(data.lon)
                }
            };
        } catch (error) {
            console.error('Error en reverse geocoding:', error);
            throw error;
        }
    }
};