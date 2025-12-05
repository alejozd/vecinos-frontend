import { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  findNearbyUsers,
  updateCurrentUserLocation,
} from "../../api/users.api";
import { useAuth } from "../../hooks/useAuth";
import { Slider } from "primereact/slider";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import "../../styles/NearbyPage.css";

// === ICONOS QUE SÍ FUNCIONAN (usa estos mientras creas los tuyos) ===
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const providerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Controlador del mapa
const MapController = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }, [points, map]);
  return null;
};

export default function NearbyPage() {
  const { token } = useAuth();

  const [geo, setGeo] = useState({ loaded: false, coords: { lat: 0, lng: 0 } });
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [radius, setRadius] = useState(10);
  const [especialidad, setEspecialidad] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeo({ loaded: true, coords: { lat, lng } });
        if (token) updateCurrentUserLocation(token, lat, lng);
      },
      () => alert("Activa la ubicación para continuar"),
      { enableHighAccuracy: true }
    );
  }, [token]);

  const loadNearbyUsers = useCallback(async () => {
    if (!geo.loaded || !token) return;
    setLoading(true);
    try {
      const users = await findNearbyUsers(
        token,
        geo.coords.lat,
        geo.coords.lng,
        radius,
        especialidad || undefined
      );
      setNearbyUsers(users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [geo.loaded, geo.coords, radius, especialidad, token]);

  useEffect(() => {
    if (geo.loaded) loadNearbyUsers();
  }, [geo.loaded, radius, especialidad]);

  const points = useMemo(
    () => [
      [geo.coords.lat, geo.coords.lng],
      ...nearbyUsers.filter((u) => u.lat && u.lng).map((u) => [u.lat, u.lng]),
    ],
    [geo.coords, nearbyUsers]
  );

  const resultsText =
    nearbyUsers.length === 0
      ? "No se encontraron profesionales"
      : `${nearbyUsers.length} profesional${
          nearbyUsers.length === 1 ? "" : "es"
        } cerca de ti`;

  return (
    <div className="nearby-page">
      <h2 className="page-title">Profesionales Cercanos</h2>

      <Card className="filters-card">
        <div className="filters-content">
          <div className="radius-filter">
            <span className="radius-label">Radio de búsqueda: {radius} km</span>
            <Slider
              value={radius}
              onChange={(e) => setRadius(e.value)}
              min={1}
              max={50}
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
            onClick={loadNearbyUsers}
            loading={loading}
            className="p-button-rounded p-button-help search-btn"
          />
        </div>
      </Card>

      <div className="results-count">{resultsText}</div>

      {!geo.loaded ? (
        <div className="loading-map">Obteniendo tu ubicación...</div>
      ) : (
        <div className="map-wrapper">
          <MapContainer
            center={[geo.coords.lat, geo.coords.lng]}
            zoom={14}
            className="leaflet-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MapController points={points} />

            {/* Tú */}
            <Marker position={[geo.coords.lat, geo.coords.lng]} icon={userIcon}>
              <Popup>
                <strong>Tú estás aquí</strong>
              </Popup>
            </Marker>

            {/* Profesionales */}
            {nearbyUsers.map((u) => (
              <Marker key={u._id} position={[u.lat, u.lng]} icon={providerIcon}>
                <Popup>
                  <div style={{ textAlign: "center", fontSize: "14px" }}>
                    <strong style={{ fontSize: "16px" }}>
                      {u.nombre || "Sin nombre"}
                    </strong>
                    <br />
                    {u.especialidad || "Profesional"}
                    <br />
                    <strong style={{ color: "#9f7aea" }}>
                      {(u.distance || 0).toFixed(1)} km
                    </strong>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <div className="users-list">
        {nearbyUsers.length === 0 && !loading && (
          <p className="no-results">
            No se encontraron profesionales con los filtros actuales.
          </p>
        )}

        {nearbyUsers.map((u) => (
          <Card key={u._id} className="user-card">
            <div className="user-card-content">
              <Avatar
                image={u.foto_url}
                label={(u.nombre || "?")[0].toUpperCase()}
                size="xlarge"
                shape="circle"
                className="user-avatar"
              />
              <div className="user-info">
                <h3>{u.nombre || "Anónimo"}</h3>
                <p className="specialty">{u.especialidad || "Profesional"}</p>
                <div className="distance">
                  <i className="pi pi-map-marker" />
                  <span>{(u.distance || 0).toFixed(1)} km</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
