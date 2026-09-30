import {
  createStaticFlow,
  type Flow,
  type FlowState,
} from "@flow-industries/id";
import { FlowIdProvider, ProfileButton } from "@flow-industries/id/react";
import { hydrateRoot } from "react-dom/client";
import { Button } from "../src/components/ui/button";
import {
  Header,
  HeaderActions,
  HeaderBrand,
} from "../src/components/ui/header";

let state: FlowState = {
  user: { id: "alice", username: "alice" },
  jwt: null,
  credential: null,
  address: null,
};
const listeners = new Set<(state: FlowState) => void>();
function update(username: string | null) {
  state = { ...state, user: username ? { id: username, username } : null };
  for (const listener of listeners) listener(state);
}
const flow: Flow = Object.assign(
  createStaticFlow(null, { host: "http://localhost:4273" }),
  {
    getState: () => state,
    subscribe: (listener: (state: FlowState) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    listAccounts: async () => ({
      activeUserId: state.user?.id ?? null,
      accounts: [
        { id: "alice", username: "alice", image: null },
        { id: "long_account_name", username: "long_account_name", image: null },
      ],
    }),
    switchAccounts: (options: { userId: string }) => {
      update(options.userId);
      return new Promise<never>(() => {});
    },
  },
);

export function HeaderFixture() {
  return (
    <FlowIdProvider flow={flow}>
      {(["ID", "Time", "Status", "Industries", "Game", "UI"] as const).map(
        (label) => (
          <Header
            key={label}
            layout="product"
            aria-label={label}
            className={
              label === "Industries"
                ? "flex-wrap min-[360px]:flex-nowrap"
                : undefined
            }
          >
            <HeaderBrand
              label={label}
              render={
                label === "ID" || label === "Industries" ? (
                  // biome-ignore lint/a11y/useAnchorContent: HeaderBrand injects the visible label through useRender
                  <a href="#account" aria-label={`${label} account`} />
                ) : undefined
              }
            />
            <HeaderActions
              className={
                label === "Industries"
                  ? "max-[359px]:w-full max-[359px]:justify-end"
                  : undefined
              }
            >
              <ProfileButton className="[&_[data-flow-profile]]:align-top" />
            </HeaderActions>
          </Header>
        ),
      )}
      <Button onClick={() => update(null)}>Signed out</Button>
      <Button onClick={() => update("alice")}>Restore</Button>
    </FlowIdProvider>
  );
}

if (globalThis.document) {
  const root = document.getElementById("root");
  if (root) hydrateRoot(root, <HeaderFixture />);
}
