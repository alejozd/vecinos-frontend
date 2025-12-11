// src/pages/Nearby/FiltersCard.jsx
import { Slider } from "primereact/slider";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

export default function FiltersCard({
  radius,
  setRadius,
  especialidad,
  setEspecialidad,
  loading,
  onSearch,
}) {
  return (
    <Card className="filters-card">
      <div className="filters-content">
        <div className="radius-filter">
          <span className="radius-label-with-icon">
            <i className="pi pi-compass"></i>
            Radio de búsqueda: {radius} km
          </span>
          <Slider
            value={radius}
            onChange={(e) => setRadius(e.value)}
            min={1}
            max={15}
            className="custom-slider"
          />
        </div>
        <InputText
          placeholder="Filtrar por especialidad"
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
          className="specialty-input"
        />
        <Button
          label="Buscar"
          onClick={onSearch}
          loading={loading}
          className="p-button-rounded p-button-help search-btn"
          icon="pi pi-search"
        />
      </div>
    </Card>
  );
}
