import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppHost } from "./AppHost.tsx";
import { AppSpectator } from "./AppSpectator.tsx";
import { Error404 } from "./Error.tsx";

import "bootstrap-icons/font/bootstrap-icons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<AppHost />} />
        <Route path="/spectate/:roomId" element={<AppSpectator />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
