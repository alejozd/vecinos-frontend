// src/pages/Nearby/NearbyHeader.jsx
import { Link } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";

export default function NearbyHeader({ user, logout }) {
  const handleLogout = () => {
    confirmDialog({
      message: "¿Estás seguro de que quieres cerrar sesión?",
      header: "Cerrar sesión",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí, salir",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-success",
      rejectClassName: "p-button-danger p-button-text",
      defaultFocus: "reject",
      accept: () => logout(),
    });
  };

  return (
    <div className="nearby-header">
      <Link to="/profile" className="profile-link">
        <Avatar
          image={user?.foto_url}
          label={user?.nombre?.[0] || "U"}
          size="large"
          shape="circle"
          className="profile-avatar-header"
        />
      </Link>
      <h2 className="page-title">Profesionales Cercanos</h2>
      <Button
        icon="pi pi-sign-out"
        label="Salir"
        outlined
        severity="danger"
        rounded
        size="small"
        onClick={handleLogout}
      />
    </div>
  );
}
