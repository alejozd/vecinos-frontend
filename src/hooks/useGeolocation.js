// src/hooks/useGeolocation.js
import { useState, useEffect } from "react";

// Define el estado inicial de la ubicación
const initialState = {
  loading: true,
  coords: null, // { lat: number, lng: number }
  error: null,
};

const useGeolocation = (options = {}) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    // 1. Verificar soporte del navegador
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocalización no soportada por este navegador.",
      }));
      return;
    }

    // 2. Función de éxito
    const onSuccess = (position) => {
      const newLat = position.coords.latitude;
      const newLng = position.coords.longitude;

      //CORRECCIÓN CLAVE: Solo actualizar el estado si las coordenadas cambiaron
      //O si el estado inicial (coords es null)
      if (
        !state.coords ||
        state.coords.lat !== newLat ||
        state.coords.lng !== newLng
      ) {
        setState({
          loading: false,
          coords: {
            lat: newLat,
            lng: newLng,
          },
          error: null,
        });
      } else {
        // Si las coordenadas son idénticas, solo asegúrate de que loading es false
        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
        }));
      }
    };

    // 3. Función de error
    const onError = (error) => {
      let errorMessage;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage =
            "Permiso denegado por el usuario. No se puede buscar vecinos.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Información de ubicación no disponible.";
          break;
        case error.TIMEOUT:
          errorMessage = "La solicitud para obtener la ubicación ha caducado.";
          break;
        default:
          errorMessage = "Error de geolocalización desconocido.";
      }
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    };

    // 4. Solicitar la ubicación
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    // Nota: Podrías usar watchPosition si necesitaras un seguimiento constante,
    // pero getCurrentPosition es mejor para una única búsqueda al inicio.
  }, [options]);

  return state;
};

export default useGeolocation;
