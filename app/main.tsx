import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles.css"
import { App } from "./App"
import { initRum } from "./rum"

initRum(
  import.meta.env.VITE_OO_RUM_TOKEN ?? "rumIPhQpKsQRwq4Piit",
  import.meta.env.VITE_APP_VERSION ?? "dev",
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
