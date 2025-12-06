// src/pages/Auth/RegisterPage.jsx
import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { classNames } from "primereact/utils";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/auth.api";
import "../../styles/AuthPages.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(""); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const { nombre, apellido, email, password, telefono } = formData;

      if (!nombre || !apellido || !email || !password) {
        throw new Error(
          "Nombre, apellido, email y contraseña son obligatorios."
        );
      }

      await registerUser({
        nombre,
        apellido,
        email,
        telefono: telefono || null,
        password,
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setError(err.message || "Error al registrar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card-wrapper">
        <Card className="register-card">
          <div className="text-center mb-5">
            <h1 className="register-title">
              <i className="pi pi-user-plus mr-3"></i>
              Crea tu cuenta
            </h1>
            <p className="text-600 text-white">
              Únete a la comunidad de vecinos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-fluid">
            {error && (
              <Message severity="error" text={error} className="mb-4" />
            )}
            {success && (
              <Message
                severity="success"
                text="¡Registro exitoso! Redirigiendo al login..."
                className="mb-4"
              />
            )}

            <div className="field mb-4">
              <span className="p-float-label">
                <InputText
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={classNames({
                    "p-invalid": !formData.nombre && error,
                  })}
                />
                <label htmlFor="nombre">
                  <i className="pi pi-user mr-2"></i> Nombre *
                </label>
              </span>
            </div>

            <div className="field mb-4">
              <span className="p-float-label">
                <InputText
                  id="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className={classNames({
                    "p-invalid": !formData.apellido && error,
                  })}
                />
                <label htmlFor="apellido">
                  <i className="pi pi-users mr-2"></i> Apellido *
                </label>
              </span>
            </div>

            <div className="field mb-4">
              <span className="p-float-label">
                <InputText
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={classNames({
                    "p-invalid": !formData.email && error,
                  })}
                />
                <label htmlFor="email">
                  <i className="pi pi-envelope mr-2"></i> Email *
                </label>
              </span>
            </div>

            <div className="field mb-4">
              <span className="p-float-label">
                <InputText
                  id="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
                <label htmlFor="telefono">
                  <i className="pi pi-phone mr-2"></i> Teléfono
                </label>
              </span>
            </div>

            <div className="field mb-5">
              <span className="p-float-label">
                <Password
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  feedback={true}
                  toggleMask
                  className={classNames({
                    "p-invalid":
                      formData.password && formData.password.length < 8,
                  })}
                />
                <label htmlFor="password">
                  <i className="pi pi-lock mr-2"></i> Contraseña *
                </label>
              </span>
              {formData.password && formData.password.length < 8 && (
                <small className="p-error">Mínimo 8 caracteres</small>
              )}
            </div>

            <Button
              label={loading ? "Creando cuenta..." : "Registrarme"}
              icon="pi pi-check"
              type="submit"
              className="p-button-rounded p-button-help w-full register-btn"
              loading={loading}
              disabled={loading}
            />
          </form>

          <div className="text-center mt-5">
            <p className="text-600 text-white">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-bold text-primary">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
