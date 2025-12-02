// src/api/auth.api.js
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Llama a la API para registrar un nuevo usuario.
 */
export const registerUser = async (nombre, email, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.msg || "Error al registrar el usuario.");
  }

  return data; // Debería retornar { id, nombre, email }
};

/**
 * Llama a la API para iniciar sesión (Movido de AuthContext)
 */
export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.msg || "Credenciales inválidas");
  }

  return data; // Retorna { token, user }
};
