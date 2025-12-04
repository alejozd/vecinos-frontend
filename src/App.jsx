// src/App.jsx

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Importaciones de Páginas (Asegúrate de que estas rutas son correctas)
import LoginPage from "./pages/Auth/LoginPage";
import NearbyPage from "./pages/Nearby/NearbyPage";
import RegisterPage from "./pages/Auth/RegisterPage";

// Definición de componente temporal o Página real
const HomePage = () => <h1>Bienvenido a Vecinos App!</h1>; // Componente temporal de inicio

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas Públicas */}
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/register" element={<RegisterPage />} /> */}

        {/* Rutas Protegidas (Requieren autenticación) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/nearby" element={<NearbyPage />} />
          {/* Aquí puedes añadir otras rutas protegidas como el perfil */}
          {/* <Route path="/profile" element={<ProfilePage />} /> */}
        </Route>

        {/* Ruta 404 - Manejo de URLs no encontradas */}
        <Route path="*" element={<h1>404 | Página no encontrada</h1>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
