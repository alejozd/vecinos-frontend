// src/pages/Nearby/ProfessionalsList.jsx
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";
import ProfessionalCard from "./ProfessionalCard";

function SkeletonCard() {
  return (
    <Card className="user-card skeleton-card">
      <div className="user-card-content">
        <div className="skeleton-avatar" />
        <div className="user-info skeleton-info">
          <div className="skeleton-line long" />
          <div className="skeleton-line short" />
          <div className="skeleton-line medium" />
        </div>
      </div>
    </Card>
  );
}

export default function ProfessionalsList({
  loading,
  nearbyUsers,
  onProfessionalClick,
}) {
  return (
    <div className="users-list">
      {loading ? (
        <>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </>
      ) : nearbyUsers.length === 0 ? (
        <p className="no-results">
          No se encontraron profesionales con los filtros actuales.
        </p>
      ) : (
        nearbyUsers.map((u) => (
          <ProfessionalCard
            key={u.id}
            u={u}
            onClick={() => onProfessionalClick(u)}
          />
        ))
      )}
    </div>
  );
}
