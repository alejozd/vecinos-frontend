// src/pages/Nearby/ProfessionalCard.jsx
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";

export default function ProfessionalCard({ u, onClick }) {
  return (
    <Card className="user-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="user-card-content">
        {/* Avatar del profesional */}
        <Avatar
          image={u.foto_url || undefined}
          label={u.nombre?.[0]?.toUpperCase() || "?"}
          size="xlarge"
          shape="circle"
          className="user-avatar"
        />

        {/* Información del profesional */}
        <div className="user-info">
          <h3>{u.nombre}</h3>

          {/* Especialidades como chips */}
          <div
            style={{
              margin: "8px 0",
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {u.especialidadesList.map((esp, i) => (
              <Chip
                key={i}
                label={esp}
                className="p-chip-info"
                style={{ fontSize: "0.85rem" }}
              />
            ))}
          </div>

          {/* Distancia */}
          <div className="distance">
            <i className="pi pi-map-marker" style={{ marginRight: 8 }} />
            <strong>{u.distanceKm} km</strong>
          </div>
        </div>
      </div>
    </Card>
  );
}
