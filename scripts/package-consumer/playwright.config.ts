import { defineConfig } from "@playwright/test";
export default defineConfig({
  testMatch: "consumer.spec.ts",
  use: { baseURL: "http://127.0.0.1:4291" },
  webServer: {
    command: "bunx vite preview --host 127.0.0.1 --port 4291 --strictPort",
    url: "http://127.0.0.1:4291",
    reuseExistingServer: false,
  },
});
