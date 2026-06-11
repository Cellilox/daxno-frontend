import { defineConfig } from "vitest/config";
import path from "path";

// Fast unit-test layer. Pure logic only (lib helpers, billing math) — runs in
// the node environment in milliseconds so it can gate every commit. Cypress E2E
// stays separate (needs a live server) and runs in CI.
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(process.cwd(), "src"),
        },
    },
    test: {
        environment: "node",
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
        // Cypress specs live under cypress/ and use a different runner.
        exclude: ["node_modules/**", "cypress/**", ".next/**"],
    },
});
