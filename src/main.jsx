import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import "primereact/resources/themes/lara-light-indigo/theme.css";
// import "primereact/resources/themes/saga-blue/theme.css";
// import "primereact/resources/primereact.min.css";
// import "primereact/resources/themes/soho-dark/theme.css";
import "primereact/resources/themes/viva-dark/theme.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import App from "./App.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
