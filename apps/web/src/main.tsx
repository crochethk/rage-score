import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App.tsx";

import "bootstrap-icons/font/bootstrap-icons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          index
          element={<App />} // TODO add HostApp component
        />
        <Route
          path="/spectate/:roomId"
          element={<h1>Route "spectate/:roomId" not implemented, yet</h1>} // TODO add SpectatorApp component
        />
        <Route
          path="*"
          element={<h1>404 Not Found</h1>} // TODO add Error404 component
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
