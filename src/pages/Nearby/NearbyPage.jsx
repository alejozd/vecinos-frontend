import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
import "../../styles/NearbyPage.css";

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
  const mapRef = useRef(null);
  const [usersVersion, setUsersVersion] = useState(0);

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
          especialidad || undefined // ← importante: undefined o cadena vacía si no hay filtro
        );
        setNearbyUsers(users);
        setUsersVersion((prev) => prev + 1);
      } catch (err) {
        console.error("Error cargando vecinos:", err);
      } finally {
        setLoadingUsers(false);
      }
    },
    [token]
  );

  const adjustMapBounds = useCallback(() => {
    if (!mapRef.current || !geo.coords) return;

    mapRef.current.invalidateSize();

    const userPoints = nearbyUsers
      .filter(
        (user) => user.lat && user.lng && !isNaN(user.lat) && !isNaN(user.lng)
      )
      .map((user) => [parseFloat(user.lat), parseFloat(user.lng)]);

    const allPoints = [[geo.coords.lat, geo.coords.lng], ...userPoints];

    if (
      allPoints.length <= 1 ||
      allPoints.every(
        (p) =>
          Math.abs(p[0] - allPoints[0][0]) < 0.0001 &&
          Math.abs(p[1] - allPoints[0][1]) < 0.0001
      )
    ) {
      mapRef.current.setView([geo.coords.lat, geo.coords.lng], 14, {
        animate: true,
      });
    } else {
      const bounds = L.latLngBounds(allPoints);
      mapRef.current.fitBounds(bounds, {
        padding: [100, 100],
        maxZoom: 15,
        animate: true,
        duration: 1.2,
      });
    }
  }, [geo.coords, nearbyUsers]);

  const handleSearch = useCallback(() => {
    if (geo.coords) {
      const especialidadLimpia = filtroEspecialidad.trim();
      loadNearbyUsers(
        geo.coords.lat,
        geo.coords.lng,
        searchRadius,
        especialidadLimpia === "" ? "" : especialidadLimpia // ← envía "" solo si está vacío
      );
    }
  }, [geo.coords, searchRadius, filtroEspecialidad, loadNearbyUsers]);

  // Carga inicial automática cuando se obtiene la ubicación
  useEffect(() => {
    if (geo.coords && nearbyUsers.length === 0) {
      handleSearch(); // Solo la primera vez
    }
  }, [geo.coords]);

  // Ajustar automáticamente el mapa para mostrar todos los vecinos + tú
  useEffect(() => {
    if (!mapRef.current || !geo.coords) return;

    console.log(
      "→ Ajustando mapa - usersVersion:",
      usersVersion,
      "| usuarios:",
      nearbyUsers.length
    );

    const timer = setTimeout(() => {
      adjustMapBounds();
    }, 600); // Un poquito más para dar tiempo a que se rendericen los marcadores

    return () => clearTimeout(timer);
  }, [usersVersion, geo.coords, adjustMapBounds]);

  // Loading completo
  if (geo.loading) {
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
      {/* Overlay loader solo cuando estamos buscando usuarios */}
      {loadingUsers && (
        <div className="loading-overlay">
          <ProgressSpinner />
        </div>
      )}
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
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;

              // Ajuste inicial cuando el mapa está listo (si ya tienes usuarios)
              setTimeout(() => {
                if (!mapRef.current) return;
                mapRef.current.invalidateSize();
                adjustMapBounds(); // Siempre lo llamamos, aunque solo haya tu posición
              }, 400);
            }}
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
              .filter(
                (user) =>
                  user.lat && user.lng && !isNaN(user.lat) && !isNaN(user.lng)
              )
              .map((user) => (
                <Marker
                  key={user.id}
                  position={[parseFloat(user.lat), parseFloat(user.lng)]}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
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
                  // onClick={handleSearch}
                  onClick={(e) => {
                    e.preventDefault(); // ← Esto evita cualquier comportamiento por defecto
                    handleSearch();
                  }}
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
                          image={user.foto_url || null}
                          label={user.nombre[0].toUpperCase()}
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
