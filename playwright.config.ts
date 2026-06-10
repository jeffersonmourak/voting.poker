import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite for the voting room. Each spec drives several browser tabs in the
 * same room; signaling goes through live Ably (the app is keyless by design),
 * so these tests need network access and are run locally / pre-release via
 * `bun run test:e2e` — they are not part of the CI gate.
 *
 * Port 4173 (not 3000) so the suite coexists with whatever occupies the
 * default dev port.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:4173",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run scripts/devGenerate.ts && bun src/index.tsx",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: "development",
      BUN_PUBLIC_SITE_HOST: "localhost:4173",
      PORT: "4173",
    },
  },
});
