// src/pages/Nearby/MapSection.jsx
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapController({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }, [points, map]);
  return null;
}

function LocateButton() {
  const map = useMap();

  return (
    <button
      type="button"
      className="custom-locate-button"
      onClick={() => map.locate({ setView: true, maxZoom: 16, animate: true })}
      title="Centrar en mi ubicación"
      aria-label="Centrar mapa en mi ubicación"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        width="24px"
        height="24px"
      >
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </svg>
    </button>
  );
}

export default function MapSection({
  geo,
  nearbyUsers,
  radius,
  userIcon,
  providerIcon,
}) {
  const points = useMemo(
    () => [
      [geo.coords.lat, geo.coords.lng],
      ...nearbyUsers
        .filter((u) => !isNaN(u.lat) && !isNaN(u.lng))
        .map((u) => [u.lat, u.lng]),
    ],
    [geo.coords, nearbyUsers]
  );

  return (
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

        <Circle
          center={[geo.coords.lat, geo.coords.lng]}
          radius={radius * 1000}
          pathOptions={{
            fillColor: "#9f7aea",
            fillOpacity: 0.25,
            color: "#c084fc",
            weight: 4,
            opacity: 1,
            dashArray: "10, 10",
          }}
        />

        <LocateButton />

        {/* Tu ubicación */}
        <Marker position={[geo.coords.lat, geo.coords.lng]} icon={userIcon}>
          <Popup>
            <strong>Tú estás aquí</strong>
          </Popup>
        </Marker>

        {/* Profesionales */}
        {nearbyUsers.map((u) => (
          <Marker key={u.id} position={[u.lat, u.lng]} icon={providerIcon}>
            <Popup>
              <div style={{ textAlign: "center", minWidth: 150 }}>
                <strong style={{ fontSize: "16px" }}>{u.nombre}</strong>
                <br />
                <small>{u.especialidadesList.join(", ")}</small>
                <br />
                <strong style={{ color: "#9f7aea" }}>{u.distanceKm} km</strong>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
