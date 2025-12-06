// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { useContext } from "react";
import { ConfirmDialog } from "primereact/confirmdialog";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Páginas
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import NearbyPage from "./pages/Nearby/NearbyPage";
import ProfilePage from "./pages/Profile/ProfilePage";

// Componente que decide qué mostrar en la raíz
const RootRedirect = () => {
  const { user, isLoading } = useContext(AuthContext);

  // Mientras carga el token/perfil
  if (isLoading) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen bg-gray-900">
        <i className="pi pi-spin pi-spinner text-6xl text-purple-500"></i>
      </div>
    );
  }

  // Si ya está logueado → va directo a Nearby
  // Si no → muestra Login
  return user ? <Navigate to="/nearby" replace /> : <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <ConfirmDialog />
      <Routes>
        {/* Ruta raíz: decide según autenticación */}
        <Route path="/" element={<RootRedirect />} />

        {/* /login: mismo comportamiento que / */}
        <Route path="/login" element={<RootRedirect />} />

        {/* Registro */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/nearby" element={<NearbyPage />} />
          {/* Aquí irán después: /profile, /requests, etc. */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 404 bonito */}
        <Route
          path="*"
          element={
            <div className="flex flex-column justify-content-center align-items-center min-h-screen bg-gray-900 text-white gap-4">
              <h1 className="text-6xl font-bold">404</h1>
              <p className="text-2xl">Página no encontrada</p>
              <a href="/" className="text-purple-400 underline">
                ← Volver al inicio
              </a>
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
