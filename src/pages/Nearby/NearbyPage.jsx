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
import { InputText } from "primereact/inputtext";
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
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");

  const loadNearbyUsers = useCallback(
    async (lat, lng, radius, especialidad = "") => {
      if (!token) return;
      setLoadingUsers(true);
      try {
        await updateCurrentUserLocation(token, lat, lng);
        const users = await findNearbyUsers(
          token,
          lat,
          lng,
          radius,
          especialidad
        );
        setNearbyUsers(users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    },
    [token]
  );

  const handleSearch = useCallback(() => {
    if (geo.coords) {
      loadNearbyUsers(
        geo.coords.lat,
        geo.coords.lng,
        searchRadius,
        filtroEspecialidad.trim()
      );
    }
  }, [geo.coords, loadNearbyUsers]);

  // Carga inicial automática cuando se obtiene la ubicación
  useEffect(() => {
    if (geo.coords) {
      handleSearch();
    }
  }, [geo.coords, handleSearch]);

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
      {/* Header */}
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

      {/* Contenido principal */}
      <div className="nearby-content">
        {/* Mapa */}
        <div className="map-container">
          <MapContainer
            center={[geo.coords.lat, geo.coords.lng]}
            zoom={14} // Más zoom para ver mejor los marcadores
            style={{ height: "100%", width: "100%", borderRadius: "28px" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />

            {/* Tú (marcador con pulso violeta) */}
            <Marker
              position={[geo.coords.lat, geo.coords.lng]}
              icon={L.divIcon({
                className: "my-location-marker",
                html: `<div style="background:#8b5cf6;width:20px;height:20px;border-radius:50%;border:4px solid white;animation:pulse 2s infinite;"></div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              })}
            >
              <Popup>¡Tú estás aquí!</Popup>
            </Marker>

            {/* Vecinos */}
            {nearbyUsers
              .filter((user) => user.lat && user.lng)
              .map((user) => (
                <Marker
                  key={user.id}
                  position={[user.lat, user.lng]}
                  icon={L.divIcon({
                    className: "neighbor-marker",
                    html: `<div style="background:#ec4899;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                  })}
                >
                  <Popup>
                    <div style={{ textAlign: "center", fontSize: "0.95rem" }}>
                      <strong>{user.nombre}</strong>
                      <br />
                      {(user.distance_m / 1000).toFixed(1)} km
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* Controles + Lista */}
        <div className="controls-and-list">
          {/* Radio de búsqueda */}
          <Card className="radius-card glass-card mb-5">
            <div className="flex align-items-center gap-4">
              <i
                className="pi pi-compass text-3xl"
                style={{ color: "#c4b5fd" }}
              ></i>
              <div className="flex-1">
                <label className="font-bold text-white text-lg block mb-3">
                  Radio de búsqueda
                </label>
                <Slider
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(e.value)}
                  min={1}
                  max={50}
                  className="custom-slider"
                />
              </div>
              <InputNumber
                value={searchRadius}
                onValueChange={(e) => setSearchRadius(e.value || 10)}
                suffix=" km"
                min={1}
                max={50}
                showButtons
                className="w-32"
              />
            </div>
            <div className="mt-5">
              <label className="font-bold text-white text-lg block mb-3">
                Filtrar por especialidad
              </label>
              <div className="p-inputgroup">
                <InputText
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                  placeholder="Ej: plomero, electricista..."
                  className="w-full"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                  // ← Sin onKeyDown → solo cambia el texto, no busca
                />
                {filtroEspecialidad && (
                  <Button
                    icon="pi pi-times"
                    className="p-button-outlined p-button-secondary"
                    onClick={() => setFiltroEspecialidad("")}
                  />
                )}
              </div>
              <div className="mt-3">
                <Button
                  label="Buscar Vecinos"
                  icon="pi pi-search"
                  className="w-full p-button-rounded p-button-lg"
                  style={{
                    background: "linear-gradient(to right, #8b5cf6, #ec4899)",
                    border: "none",
                  }}
                  onClick={handleSearch}
                  loading={loadingUsers}
                />
              </div>
            </div>
          </Card>

          {/* Lista de usuarios */}
          {nearbyUsers.length === 0 ? (
            <div className="empty-state text-center py-8">
              <i className="pi pi-users text-8xl text-gray-500 mb-4"></i>
              <h3 className="text-2xl font-bold text-white">
                No hay vecinos en este radio
              </h3>
              <p className="text-gray-300 text-lg">
                Aumenta el radio para ver más personas
              </p>
            </div>
          ) : (
            <div className="users-grid">
              {nearbyUsers.map((user) => (
                <Card
                  key={user.id}
                  className="user-card glass-card hover-lift mb-4"
                >
                  <div className="flex gap-5 items-center">
                    <div className="flex flex-column align-items-center">
                      <div className="relative">
                        <Avatar
                          image={user.foto_url}
                          label={
                            !user.foto_url
                              ? user.nombre[0].toUpperCase()
                              : undefined
                          }
                          size="xlarge"
                          shape="circle"
                          className="border-4 border-white shadow-8"
                        />
                      </div>
                      <Badge
                        value={`${(user.distance_m / 1000).toFixed(1)} km`}
                        className="distance-badge-below mt-3"
                        severity="success"
                        // className="mt-3"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {user.nombre}
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">{user.email}</p>
                      <p className="text-gray-200 text-base">
                        {user.descripcion || "Miembro de la comunidad vecinal"}
                      </p>
                      {user.especialidades &&
                        user.especialidades.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {user.especialidades.map((esp, index) => (
                              <Badge
                                key={index}
                                value={esp.especialidad}
                                severity="info"
                                className="p-badge-lg"
                              />
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="flex flex-column gap-3">
                      <Button
                        icon="pi pi-comment"
                        rounded
                        className="p-button-success p-button-outlined"
                        tooltip="Mensaje"
                        tooltipOptions={{ position: "left" }}
                      />
                      <Button
                        icon="pi pi-phone"
                        rounded
                        className="p-button-info p-button-outlined"
                        tooltip="Llamar"
                        tooltipOptions={{ position: "left" }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyPage;
