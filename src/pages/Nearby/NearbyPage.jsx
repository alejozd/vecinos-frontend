import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import useGeolocation from "../../hooks/useGeolocation";
import {
  findNearbyUsers,
  updateCurrentUserLocation,
} from "../../api/users.api";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Slider } from "primereact/slider";
import { InputNumber } from "primereact/inputnumber";
import { Avatar } from "primereact/avatar"; // Añadimos Avatar para un look más moderno

const NearbyPage = () => {
  const { token } = useAuth();
  // Se corrigió el uso de useMemo en geoOptions, ya que la dependencia del hook no debe ser un objeto nuevo en cada render.
  const geoOptions = useMemo(() => ({ enableHighAccuracy: true }), []);
  const geo = useGeolocation(geoOptions);

  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10); // Default 10km

  // Función para obtener y mostrar los vecinos cercanos
  const loadNearbyUsers = useCallback(
    async (lat, lng, radius) => {
      if (!token) return;

      setLoadingUsers(true);
      setUsersError(null);
      try {
        await updateCurrentUserLocation(token, lat, lng);
        const users = await findNearbyUsers(token, lat, lng, radius);
        setNearbyUsers(users);
      } catch (err) {
        console.error("Error al cargar vecinos:", err);
        setUsersError(
          err.message || "Error desconocido en la carga de vecinos."
        );
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (geo.coords && geo.coords.lat && geo.coords.lng) {
      loadNearbyUsers(geo.coords.lat, geo.coords.lng, searchRadius);
    }
  }, [geo.coords, loadNearbyUsers, searchRadius]); // Dependencias para re-ejecución

  // ------------------------------------
  // Renderizado del estado
  // ------------------------------------

  // Pantalla de carga
  if (geo.loading || loadingUsers) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        <ProgressSpinner />
        <h3 className="ml-3">Buscando tu ubicación y vecinos...</h3>
      </div>
    );
  }

  // Errores
  if (geo.error) {
    return (
      <div className="p-5">
        <Message severity="error" text={`Error de Ubicación: ${geo.error}`} />
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-5">
        <Message
          severity="error"
          text={`Error al cargar vecinos: ${usersError}`}
        />
      </div>
    );
  }

  // Contenido Principal
  return (
    <div className="p-5">
      <h2 className="mb-4">Vecinos y Servicios Cercanos</h2>
      <p className="mb-3 text-sm text-500">
        Tu ubicación actual: Lat: {geo.coords.lat.toFixed(4)}, Lng:{" "}
        {geo.coords.lng.toFixed(4)}
      </p>

      {/* 🛑 COMPONENTE DE FILTRO DE RADIO (Ahora siempre visible) */}
      <div className="card flex flex-column gap-3 mb-5 p-4 surface-100 border-round-md shadow-2">
        <label className="font-bold text-700">
          Radio de Búsqueda ({searchRadius} km)
        </label>
        <div className="flex align-items-center gap-3">
          <Slider
            value={searchRadius}
            onChange={(e) => setSearchRadius(e.value)}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
          <InputNumber
            value={searchRadius}
            onValueChange={(e) => setSearchRadius(e.value)}
            suffix=" km"
            min={1}
            max={50}
            className="w-4rem"
          />
        </div>
      </div>

      {nearbyUsers.length === 0 ? (
        <Message
          severity="info"
          text={`No se encontraron proveedores de servicio en el radio de búsqueda (${searchRadius} km).`}
        />
      ) : (
        <div className="grid mt-3">
          {nearbyUsers.map((user) => (
            // 🛑 Uso de PrimeFlex grid: 12 columnas en móvil, 6 en tablet, 4 en escritorio
            <div key={user.id} className="col-12 md:col-6 lg:col-4">
              <Card className="shadow-2 hover:shadow-4 transition-all transition-duration-300">
                <div className="flex align-items-center gap-3">
                  <Avatar
                    label={user.nombre[0]}
                    size="xlarge"
                    shape="circle"
                    className="bg-primary text-white"
                    image={user.foto_url} // Si tiene URL de foto
                  />
                  <div>
                    <h4 className="m-0 text-lg font-semibold">{user.nombre}</h4>
                    <p className="m-0 text-sm text-500">{user.email}</p>
                    <p className="m-0 mt-2 text-primary font-bold">
                      {/* Distancia en metros / 1000 = km */}A{" "}
                      {(user.distance_m / 1000).toFixed(2)} km
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-sm text-600">
                  <p className="m-0">
                    {user.descripcion ||
                      "Proveedor de servicio de la comunidad."}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyPage;
