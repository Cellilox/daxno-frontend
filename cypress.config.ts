import { defineConfig } from "cypress";
import { clerkSetup } from "@clerk/testing/cypress";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local (Next.js convention) into process.env so we don't have
// to duplicate Clerk creds in cypress.env.json. The keys live in one place.
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

// @clerk/testing's clerkSetup() looks for CLERK_PUBLISHABLE_KEY (no NEXT_PUBLIC_
// prefix). Next.js stores it as NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Mirror it.
if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    process.env.CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:3001",
        async setupNodeEvents(on, config) {
            // clerkSetup reads CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY from
            // process.env (now sourced from .env.local) and exposes them to
            // specs so cy.clerkSignIn() can mint a real session via Clerk's
            // Backend API.
            return clerkSetup({ config });
        },
        viewportWidth: 1280,
        viewportHeight: 720,
        video: false,
        screenshotOnRunFailure: true,
        experimentalModifyObstructiveThirdPartyCode: true,
        defaultCommandTimeout: 8000,
        requestTimeout: 8000,
        responseTimeout: 15000,
        pageLoadTimeout: 60000,
        // No retries: a failing test should fail fast, not 3x the wall time.
        // Cypress retries inside .should/.contains anyway, so we're not losing
        // resilience — only saving multiplicative time on real failures.
        retries: 0,
    },
});
