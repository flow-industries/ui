import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./App";

import { initRum } from "./rum";

const FocusShowcase = lazy(() =>
  import("./FocusShowcase").then((module) => ({
    default: module.FocusShowcase,
  })),
);

initRum(
  import.meta.env.VITE_OO_RUM_TOKEN ?? "rumIPhQpKsQRwq4Piit",
  import.meta.env.VITE_APP_VERSION ?? "dev",
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<p>Loading practice…</p>}>
      {window.location.hash === "#focus" ? <FocusShowcase /> : <App />}
    </Suspense>
  </StrictMode>,
);
