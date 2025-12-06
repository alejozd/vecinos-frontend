// src/pages/Profile/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { Link } from "react-router-dom";
import "../../styles/ProfilePage.css";

const especialidadesComunes = [
  "Electricista",
  "Plomero",
  "Carpintero",
  "Pintor",
  "Jardinero",
  "Albañil",
  "Técnico de neveras",
  "Técnico de lavadoras",
  "Cerrajero",
  "Gasista",
  "Fumigador",
  "Limpieza",
  "Mudanzas",
  "Otro",
];

export default function ProfilePage() {
  const { user, token } = useAuth();
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  const [experiencia, setExperiencia] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    foto_url: "",
    descripcion: "",
    especialidades: [],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        telefono: user.telefono || "",
        foto_url: user.foto_url || "",
        descripcion: user.descripcion || "",
        especialidades: user.especialidades || [],
      });
    }
  }, [user]);

  const guardarPerfil = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.current.show({
          severity: "success",
          summary: "¡Listo!",
          detail: "Perfil actualizado",
          life: 3000,
        });
      }
    } catch (err) {
      console.error("Error guardando perfil:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo guardar",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const agregarEspecialidad = () => {
    if (!nuevaEspecialidad || experiencia === null) return;

    const nueva = {
      especialidad: nuevaEspecialidad,
      experiencia,
      descripcion: "",
    };

    setFormData((prev) => ({
      ...prev,
      especialidades: [...prev.especialidades, nueva],
    }));

    setShowAddDialog(false);
    setNuevaEspecialidad("");
    setExperiencia(null);
  };

  const eliminarEspecialidad = (index) => {
    setFormData((prev) => ({
      ...prev,
      especialidades: prev.especialidades.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="profile-container">
        <div className="profile-header">
          <Link to="/nearby" className="back-btn">
            ← Volver
          </Link>
          <h1>Mi Perfil</h1>
        </div>

        <Card className="profile-card">
          <div className="text-center mb-5">
            <Avatar
              image={formData.foto_url || "/default-avatar.png"}
              size="xlarge"
              shape="circle"
              className="profile-avatar"
            />
            <h2 className="mt-3">
              {formData.nombre} {formData.apellido}
            </h2>
          </div>

          <div className="grid">
            <div className="col-12 md:col-6">
              <label>Nombre</label>
              <InputText
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                }
              />
            </div>
            <div className="col-12 md:col-6">
              <label>Apellido</label>
              <InputText
                value={formData.apellido}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, apellido: e.target.value }))
                }
              />
            </div>
            <div className="col-12 md:col-6">
              <label>Teléfono / WhatsApp</label>
              <InputText
                value={formData.telefono}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, telefono: e.target.value }))
                }
              />
            </div>
            <div className="col-12 md:col-6">
              <label>URL de foto (opcional)</label>
              <InputText
                value={formData.foto_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, foto_url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div className="col-12">
              <label>Descripción / Sobre mí</label>
              <InputTextarea
                rows={4}
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                placeholder="Ej: Electricista con 8 años de experiencia en Bogotá..."
              />
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-content-between align-items-center mb-3">
              <h3>Mis especialidades</h3>
              <Button
                icon="pi pi-plus"
                label="Agregar"
                className="p-button-success p-button-sm"
                onClick={() => setShowAddDialog(true)}
              />
            </div>

            <div className="specialties-grid">
              {formData.especialidades.length === 0 ? (
                <p className="text-500">Aún no has agregado especialidades</p>
              ) : (
                formData.especialidades.map((esp, i) => (
                  <Chip
                    key={i}
                    label={`${esp.especialidad} • ${esp.experiencia} años`}
                    removable
                    onRemove={() => eliminarEspecialidad(i)}
                    className="mb-2"
                  />
                ))
              )}
            </div>
          </div>

          <Button
            label="Guardar cambios"
            icon="pi pi-save"
            className="w-full mt-5 p-button-help"
            loading={loading}
            onClick={guardarPerfil}
          />
        </Card>

        {/* Dialog para agregar especialidad */}
        <Dialog
          header="Nueva especialidad"
          visible={showAddDialog}
          onHide={() => setShowAddDialog(false)}
          style={{ width: "90vw", maxWidth: "500px" }}
        >
          <div className="p-fluid">
            <div className="field">
              <label>Especialidad</label>
              <Dropdown
                value={nuevaEspecialidad}
                options={especialidadesComunes.map((e) => ({
                  label: e,
                  value: e,
                }))}
                onChange={(e) => setNuevaEspecialidad(e.value)}
                placeholder="Selecciona o escribe..."
                editable
              />
            </div>
            <div className="field">
              <label>Años de experiencia</label>
              <InputNumber
                value={experiencia}
                onValueChange={(e) => setExperiencia(e.value)}
                min={0}
                max={50}
                showButtons
              />
            </div>
            <div className="flex justify-content-end gap-3 mt-4">
              <Button
                label="Cancelar"
                className="p-button-text"
                onClick={() => setShowAddDialog(false)}
              />
              <Button label="Agregar" onClick={agregarEspecialidad} />
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
}
