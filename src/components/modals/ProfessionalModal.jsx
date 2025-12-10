// src/components/ProfessionalModal.jsx
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";

export default function ProfessionalModal({ professional, visible, onHide }) {
  if (!professional) return null;

  const phone = professional.telefono || "3001234567";
  const whatsappLink = `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={professional.nombre}
      modal
      className="professional-modal"
      style={{ width: "90vw", maxWidth: "500px" }}
    >
      <div className="p-text-center mb-4">
        <Avatar
          image={professional.foto_url}
          label={professional.nombre[0]}
          size="xlarge"
          shape="circle"
          className="modal-avatar"
        />
        <h2 className="mt-3 mb-1">
          {professional.nombre} {professional.apellido}
        </h2>
        <p className="text-600">
          {professional.descripcion || "Profesional confiable"}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="mb-3">Especialidades</h3>
        <div className="flex flex-wrap gap-2">
          {professional.especialidades?.length > 0 ? (
            professional.especialidades.map((esp, i) => (
              <div key={i} className="specialty-item">
                <Chip label={esp.especialidad} className="mb-2" />
                <p className="text-sm text-500 mb-1">
                  {esp.experiencia} años de experiencia
                </p>
                {esp.descripcion && (
                  <p className="text-sm italic">"{esp.descripcion}"</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-500">Sin especialidades registradas</p>
          )}
        </div>
      </div>

      <div className="flex justify-content-center gap-3">
        <Button
          label="Contactar por WhatsApp"
          icon="pi pi-whatsapp"
          className="p-button-success"
          onClick={() => window.open(whatsappLink, "_blank")}
        />
        {professional.telefono && (
          <Button
            label="Llamar"
            icon="pi pi-phone"
            className="p-button-info"
            onClick={() => (window.location.href = `tel:${phone}`)}
          />
        )}
      </div>
    </Dialog>
  );
}
