// src/pages/Auth/LoginPage.jsx
import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "../../styles/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/nearby");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Fondo animado sutil */}
      <div className="background-animation"></div>

      <div className="login-wrapper">
        <Card className="login-card glass-card">
          <div className="login-header">
            <div className="logo-circle">
              <i className="pi pi-home"></i>
            </div>
            <h1>Acceso Vecinal</h1>
            <p>Bienvenido de vuelta a tu comunidad</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <Message
                severity="error"
                text={error}
                className="mb-4 error-msg"
              />
            )}

            {/* Input con label flotante */}
            <div className="field">
              <span className="p-float-label p-input-icon-left w-full">
                <i className="pi pi-envelope" />
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
                <label htmlFor="email">Correo electrónico</label>
              </span>
            </div>

            <div className="field">
              <span className="p-float-label p-input-icon-left w-full">
                <i className="pi pi-lock" />
                <InputText
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
                <label htmlFor="password">Contraseña</label>
              </span>
            </div>

            <div className="flex justify-content-between align-items-center mb-5">
              <label className="p-checkbox-label">
                <input type="checkbox" className="mr-2" />
                Recordarme
              </label>
              <a href="#" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              label="Iniciar Sesión"
              icon="pi pi-sign-in"
              type="submit"
              className="w-full login-btn"
              loading={loading}
              raised
            />

            <Divider className="custom-divider" />
            <span className="p-checkbox-label">o continúa con</span>
            <p></p>
            <Button
              label="Crear cuenta nueva"
              icon="pi pi-user-plus"
              className="w-full register-btn"
              outlined
              onClick={() => navigate("/register")}
            />
          </form>

          <p className="text-center mt-5 text-500 text-md font-bold">
            © 2025 Acceso Vecinal. Todos los derechos reservados.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
