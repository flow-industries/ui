import { createRoot } from "react-dom/client";
import { Button } from "../src/components/ui/button";
import { FlowFooter } from "../src/components/ui/flow-footer";
import { FloatingHeader, HeaderBrand } from "../src/components/ui/header";
import { ProfilePill } from "../src/components/ui/profile-pill";

const params = new URLSearchParams(window.location.search);
const label = params.get("brand") ?? "Industries";
const username = params.get("user");
const footer = params.get("footer");

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    footer ? (
      <FlowFooter status={footer !== "no-status"} statusApiUrl="" />
    ) : (
      <FloatingHeader
        brand={<HeaderBrand label={label} render={<a href="#home" />} />}
        end={
          username ? (
            <ProfilePill username={username} status="online" self />
          ) : (
            <Button variant="secondary">Join</Button>
          )
        }
      />
    ),
  );
}
