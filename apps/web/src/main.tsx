import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppHost } from "./AppHost.tsx";
import { AppSpectator } from "./AppSpectator.tsx";
import { Error404 } from "./Error.tsx";
import { HostWrapper } from "./contexts/socket/HostWrapper.tsx";
import { SpectatorWrapper } from "./contexts/socket/SpectatorWrapper.tsx";

import "bootstrap-icons/font/bootstrap-icons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./main.css";

const RELAY_SERVER_URL =
  (import.meta.env.VITE_RELAY_SERVER_URL as string) ?? "http://localhost:3333";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HostWrapper url={RELAY_SERVER_URL} />}>
          <Route index element={<AppHost />} />
        </Route>
        <Route
          path="/spectate/:roomId"
          element={<SpectatorWrapper url={RELAY_SERVER_URL} />}
        >
          <Route index element={<AppSpectator />} />
        </Route>
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
