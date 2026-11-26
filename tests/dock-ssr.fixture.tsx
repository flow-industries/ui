import {
  Activity,
  ChartLine,
  Gauge,
  Moon,
  RefreshCw,
  ScrollText,
  Server,
  Ticket,
} from "lucide-react";
import { hydrateRoot } from "react-dom/client";
import { Dock } from "../src/components/ui/dock";

export function DockFixture() {
  return (
    <Dock
      items={[
        {
          label: "Overview",
          icon: <Gauge />,
          href: "#overview",
          current: true,
        },
        { label: "Services", icon: <Server />, href: "#services" },
        { label: "Logs", icon: <ScrollText />, href: "#logs" },
        { label: "Traces", icon: <Activity />, href: "#traces" },
        { label: "Tickets", icon: <Ticket />, href: "#tickets" },
        { label: "Charts", icon: <ChartLine />, href: "#charts" },
        { label: "Refresh", icon: <RefreshCw />, onClick: () => {} },
        {
          label: "Dark mode",
          icon: <Moon />,
          pressed: false,
          onClick: () => {},
        },
      ]}
    />
  );
}

if (globalThis.document) {
  const root = document.getElementById("root");
  if (root) hydrateRoot(root, <DockFixture />);
}
