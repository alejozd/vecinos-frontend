import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import useGeolocation from "../../hooks/useGeolocation";
import {
  findNearbyUsers,
  updateCurrentUserLocation,
} from "../../api/users.api";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Slider } from "primereact/slider";
import { InputNumber } from "primereact/inputnumber";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { Card } from "primereact/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/NearbyPage.css"; // ← Tu nuevo CSS brutal

// Fix para iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const NearbyPage = () => {
  const { token } = useAuth();
  const geoOptions = useMemo(() => ({ enableHighAccuracy: true }), []);
  const geo = useGeolocation(geoOptions);

  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10);

  const loadNearbyUsers = useCallback(
    async (lat, lng, radius) => {
      if (!token) return;
      setLoadingUsers(true);
      try {
        await updateCurrentUserLocation(token, lat, lng);
        const users = await findNearbyUsers(token, lat, lng, radius);
        setNearbyUsers(users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (geo.coords) {
      loadNearbyUsers(geo.coords.lat, geo.coords.lng, searchRadius);
    }
  }, [geo.coords, searchRadius, loadNearbyUsers]);

  // Loading completo
  if (geo.loading || loadingUsers) {
    return (
      <div className="nearby-container">
        <div className="skeleton-header" />
        <div className="skeleton-map" />
        <div className="grid mt-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-12 md:col-6 lg:col-4">
              <div className="skeleton-card" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (geo.error) {
    return (
      <div className="nearby-container p-6">
        <Message severity="error" text={`Error de ubicación: ${geo.error}`} />
      </div>
    );
  }

  return (
    <div className="nearby-container">
      {/* Header moderno */}
      <div className="nearby-header">
        <div>
          <h1 className="title-gradient">Vecinos Cercanos</h1>
          <p className="subtitle">
            {nearbyUsers.length} persona{nearbyUsers.length !== 1 ? "s" : ""}{" "}
            cerca de ti
          </p>
        </div>
        <div className="location-badge">
          <i className="pi pi-map-marker"></i>
          <span>{searchRadius} km alrededor</span>
        </div>
      </div>

      {/* Mapa + Lista */}
      <div className="nearby-content">
        {/* Mapa interactivo */}
        <div className="map-container">
          <MapContainer
            center={[geo.coords.lat, geo.coords.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%", borderRadius: "24px" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            <Marker position={[geo.coords.lat, geo.coords.lng]}>
              <Popup>Tú estás aquí</Popup>
            </Marker>
            {nearbyUsers
              .filter((user) => user.lat && user.lng)
              .map((user) => (
                <Marker
                  key={user.id}
                  position={[user.lat, user.lng]}
                  icon={L.divIcon({
                    className: "custom-marker",
                    html: `<div style="background:#ec4899;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.4);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  })}
                >
                  <Popup>
                    <div style={{ textAlign: "center" }}>
                      <strong>{user.nombre}</strong>
                      <br />
                      {(user.distance_m / 1000).toFixed(1)} km
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* Filtro de radio */}
        <Card className="radius-card glass-card">
          <div className="flex align-items-center gap-4">
            <i className="pi pi-compass text-2xl text-primary"></i>
            <div className="flex-1">
              <label className="font-semibold">Radio de búsqueda</label>
              <Slider
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.value)}
                min={1}
                max={50}
                className="mt-3"
              />
            </div>
            <InputNumber
              value={searchRadius}
              onValueChange={(e) => setSearchRadius(e.value || 10)}
              suffix=" km"
              min={1}
              max={50}
              showButtons
              buttonLayout="horizontal"
              decrementButtonClassName="p-button-outlined"
              incrementButtonClassName="p-button-outlined"
            />
          </div>
        </Card>

        {/* Lista de usuarios */}
        {nearbyUsers.length === 0 ? (
          <div className="empty-state">
            <i className="pi pi-users text-6xl text-400 mb-4"></i>
            <h3>No hay vecinos en este radio</h3>
            <p className="text-600">
              Aumenta el radio de búsqueda para ver más personas
            </p>
          </div>
        ) : (
          <div className="users-grid">
            {nearbyUsers.map((user) => (
              <Card key={user.id} className="user-card glass-card hover-lift">
                <div className="flex gap-4">
                  <div className="relative">
                    <Avatar
                      image={user.foto_url}
                      label={!user.foto_url ? user.nombre[0] : undefined}
                      size="xlarge"
                      shape="circle"
                      className="border-3 border-white shadow-4"
                    />
                    <Badge
                      value={`${(user.distance_m / 1000).toFixed(1)}km`}
                      severity="success"
                      className="distance-badge"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-900 mb-1">
                      {user.nombre}
                    </h3>
                    <p className="text-600 text-sm mb-2">{user.email}</p>
                    <p className="text-700 line-height-3">
                      {user.descripcion || "Miembro de la comunidad vecinal"}
                    </p>
                  </div>

                  <div className="flex flex-column justify-content-between">
                    <Button
                      icon="pi pi-message"
                      rounded
                      text
                      className="p-button-rounded p-button-success"
                      tooltip="Enviar mensaje"
                    />
                    <Button
                      icon="pi pi-phone"
                      rounded
                      text
                      className="p-button-rounded p-button-info mt-2"
                      tooltip="Llamar"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyPage;
