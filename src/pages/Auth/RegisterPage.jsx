// src/pages/Auth/RegisterPage.jsx
import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/auth.api";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const { nombre, email, password } = formData;
      if (!nombre || !email || !password) {
        throw new Error("Por favor, completa todos los campos.");
      }

      // Llama a la función de registro de la API
      await registerUser(nombre, email, password);

      setSuccess(true);
      setFormData({ nombre: "", email: "", password: "" });

      // Retraso para que el usuario vea el mensaje de éxito antes de redirigir
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Error desconocido al registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen">
      <Card title="Registro de Nuevo Vecino" className="w-full md:w-30rem">
        <form onSubmit={handleSubmit} className="p-fluid">
          {error && <Message severity="error" text={error} className="mb-3" />}
          {success && (
            <Message
              severity="success"
              text="¡Registro exitoso! Redirigiendo a Login..."
              className="mb-3"
            />
          )}

          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <InputText
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <InputText
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            label="Registrar"
            icon="pi pi-user-plus"
            type="submit"
            className="mt-3"
            loading={loading}
          />
        </form>
        <p className="mt-4 text-center">
          ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión aquí</Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
