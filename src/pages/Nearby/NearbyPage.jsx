import { useState, useEffect, useCallback } from "react";
import {
  findNearbyUsers,
  updateCurrentUserLocation,
} from "../../api/users.api";
import { useAuth } from "../../hooks/useAuth";
import NearbyHeader from "./NearbyHeader";
import FiltersCard from "./FiltersCard";
import MapSection from "./MapSection";
import ProfessionalsList from "./ProfessionalsList";
import { Link, useNavigate } from "react-router-dom"; // ← AGREGA ESTO
import * as L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import ProfessionalModal from "../../components/modals/ProfessionalModal";
import "../../styles/NearbyPage.css";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Tu ubicación del usuario (azul)
const userIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Profesional (morado)
const providerIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function NearbyPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [geo, setGeo] = useState({ loaded: false, coords: { lat: 0, lng: 0 } });
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [radius, setRadius] = useState(5);
  const [especialidad, setEspecialidad] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const handleProfessionalClick = (professional) => {
    setSelectedProfessional(professional);
    setModalVisible(true);
  };

  useEffect(() => {
    if (!user) return;

    const especialidades = user.especialidades || [];
    const yaMostroPerfil = localStorage.getItem("perfilMostrado");
    if (
      especialidades.length === 0 &&
      !yaMostroPerfil &&
      window.location.pathname !== "/profile"
    ) {
      localStorage.setItem("perfilMostrado", "true");
      navigate("/profile", { replace: true });
    }
  }, [user, navigate]);

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

      const processedUsers = (users || [])
        .filter((u) => u.id !== user.id)
        .map((u) => ({
          ...u,
          lat: parseFloat(u.lat),
          lng: parseFloat(u.lng),
          distanceKm: u.distance_m ? (u.distance_m / 1000).toFixed(2) : "0.0",
          especialidadesList:
            u.especialidades?.map((e) => e.especialidad) || [],
        }));

      setNearbyUsers(processedUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [geo.loaded, geo.coords, radius, especialidad, token]);

  useEffect(() => {
    if (geo.loaded) loadNearbyUsers();
  }, [geo.loaded, radius, token]);

  const resultsText =
    nearbyUsers.length === 0
      ? "No se encontraron profesionales"
      : `${nearbyUsers.length} profesional${
          nearbyUsers.length === 1 ? "" : "es"
        } cerca de ti`;

  return (
    <div className="nearby-page">
      <NearbyHeader user={user} logout={logout} />

      <FiltersCard
        radius={radius}
        setRadius={setRadius}
        especialidad={especialidad}
        setEspecialidad={setEspecialidad}
        loading={loading}
        onSearch={loadNearbyUsers}
      />

      <div className="results-count">
        <i className="pi pi-map-marker results-icon"></i>
        {resultsText}
      </div>

      {!geo.loaded ? (
        <div className="loading-map">Obteniendo tu ubicación...</div>
      ) : (
        <MapSection
          geo={geo}
          nearbyUsers={nearbyUsers}
          radius={radius}
          userIcon={userIcon}
          providerIcon={providerIcon}
        />
      )}

      <ProfessionalsList
        loading={loading}
        nearbyUsers={nearbyUsers}
        onProfessionalClick={handleProfessionalClick}
      />
      <ProfessionalModal
        professional={selectedProfessional}
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
      />
    </div>
  );
}
