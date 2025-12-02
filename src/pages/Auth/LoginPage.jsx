// src/pages/Auth/LoginPage.jsx
import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";

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
      navigate("/nearby"); // Redirige a la página principal tras el éxito
    } catch (err) {
      setError(err.message || "Error desconocido al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen surface-ground">
      <Card
        title={
          <span className="text-3xl font-bold text-900">Acceso Vecinal</span>
        }
        className="w-full sm:w-28rem lg:w-30rem p-5 surface-card shadow-6 border-round-xl animation-duration-500 animation-ease-out"
      >
        <form onSubmit={handleSubmit} className="p-fluid">
          {error && <Message severity="error" text={error} className="mb-3" />}

          <div className="field">
            <label
              htmlFor="email"
              className="font-semibold mb-2 block text-900"
            >
              Email
            </label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-inputtext-lg border-round-lg hover:border-primary-500 transition-duration-300"
            />
          </div>

          <div className="field mt-3">
            <label
              htmlFor="password"
              className="font-semibold mb-2 block text-900"
            >
              Contraseña
            </label>
            <InputText
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-inputtext-lg border-round-lg hover:border-primary-500 transition-duration-300"
            />
          </div>

          <Button
            label="Iniciar Sesión"
            icon="pi pi-sign-in"
            type="submit"
            className="w-full mt-4 p-button-lg p-button-success font-bold border-round-lg"
            loading={loading}
          />
          <Divider align="center" className="my-5">
            <span className="text-sm text-500 bg-white px-2 border-round">
              ¿Aún no te has unido?
            </span>
          </Divider>
          <Button
            label="Crear una Cuenta Nueva"
            icon="pi pi-user-plus"
            className="w-full p-button-lg p-button-outlined p-button-secondary font-bold border-round-lg"
            onClick={() => navigate("/register")}
          />
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
