// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  // ------------------------------------------
  // Lógica de Autenticación
  // ------------------------------------------

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        return true;
      } else {
        throw new Error(data.msg || "Error de login");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  // ------------------------------------------
  // Carga de Perfil (Validar token al iniciar)
  // ------------------------------------------

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const profile = await res.json();
          setUser(profile);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
