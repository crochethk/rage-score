import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppHost } from "./AppHost.tsx";
import { AppSpectator } from "./AppSpectator.tsx";
import { Error404 } from "./Error.tsx";
import { ConsoleMirror } from "./components/ConsoleMirror.tsx";
import { HostWrapper } from "./contexts/socket/HostWrapper.tsx";
import { SpectatorWrapper } from "./contexts/socket/SpectatorWrapper.tsx";
import { env } from "./env.ts";

import "bootstrap-icons/font/bootstrap-icons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {env.debug.showConsole && <ConsoleMirror />}
      <Routes>
        <Route path="/" element={<HostWrapper url={env.config.serverUrl} />}>
          <Route index element={<AppHost />} />
        </Route>
        <Route
          path="/spectate/:roomId"
          element={<SpectatorWrapper url={env.config.serverUrl} />}
        >
          <Route index element={<AppSpectator />} />
        </Route>
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
