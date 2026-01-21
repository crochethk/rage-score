import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppHost } from "./AppHost.tsx";
import { AppSpectator } from "./AppSpectator.tsx";

import "bootstrap-icons/font/bootstrap-icons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<AppHost />} />
        <Route path="/spectate/:roomId" element={<AppSpectator />} />
        <Route
          path="*"
          element={<h1>404 Not Found</h1>} // TODO add Error404 component
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
