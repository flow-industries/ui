import { createFocusApi, type FocusApi } from "@flow-industries/id/focus";
import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { FocusProvider, useFocus } from "../src/focus/provider";

function Observer() {
  const { study, loadStudy } = useFocus();
  useEffect(() => loadStudy(), [loadStudy]);
  return (
    <>
      <output>{JSON.stringify(study)}</output>
      <button type="button" onClick={loadStudy}>
        Retry
      </button>
    </>
  );
}

function Fixture() {
  const [viewer, setViewer] = useState("Alice");
  const api = useMemo<FocusApi>(
    () => ({
      ...createFocusApi("https://unused.invalid", async () => null, "web"),
      active: async () => null,
      catalog: async () => ({ actions: [] }),
      studyCatalog: async () => {
        if (localStorage.getItem("failure") === "catalog")
          throw new Error("Catalog unavailable");
        return {
          version: 1,
          categories: [{ slug: "languages", label: "Languages", fields: [] }],
        };
      },
      subjects: async () => {
        if (localStorage.getItem("failure") === "subjects")
          throw new Error("Subjects unavailable");
        if (viewer === "Alice")
          await new Promise((resolve) => setTimeout(resolve, 250));
        return {
          subjects: [
            {
              id: viewer,
              name: viewer,
              field: null,
              archivedAt: null,
              createdAt: "2026-09-08T00:00:00Z",
              lastUsedAt: "2026-09-08T00:00:00Z",
            },
          ],
        };
      },
    }),
    [viewer],
  );
  return (
    <>
      <button type="button" onClick={() => setViewer("Bob")}>
        Switch
      </button>
      <FocusProvider api={api} viewerId={viewer}>
        <Observer />
      </FocusProvider>
    </>
  );
}
const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <StrictMode>
      <Fixture />
    </StrictMode>,
  );
