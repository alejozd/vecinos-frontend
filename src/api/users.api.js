const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3400";
const API = `${API_URL}/api`;

/**
 * Llama al backend para obtener la lista de usuarios (proveedores) cercanos.
 * @param {string} token - JWT del usuario autenticado.
 * @param {number} lat - Latitud del usuario actual.
 * @param {number} lng - Longitud del usuario actual.
 * @param {number} max - Radio de búsqueda en kilómetros (por defecto 10 km).
 * @returns {Promise<Array>} Lista de usuarios cercanos.
 */
export const findNearbyUsers = async (
  token,
  lat,
  lng,
  radius,
  especialidad = ""
) => {
  let url = `${API}/users/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;

  // Solo añadir el parámetro si hay texto real
  if (especialidad && especialidad.trim() !== "") {
    url += `&especialidad=${encodeURIComponent(especialidad.trim())}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}`);
  }

  return await response.json();
};

/**
 * Llama al backend para actualizar la ubicación del usuario autenticado.
 * @param {string} token - JWT del usuario autenticado.
 * @param {number} lat - Nueva latitud.
 * @param {number} lng - Nueva longitud.
 * @returns {Promise<void>}
 */
export const updateCurrentUserLocation = async (token, lat, lng) => {
  const url = `${API_URL}/api/users/location`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lat, lng }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.msg || "Error al actualizar la ubicación.");
  }
};
