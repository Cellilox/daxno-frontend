// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import './offline-helpers';

// Registers cy.clerkSignIn(), cy.clerkSignOut(), cy.clerkLoaded()
// using the official @clerk/testing package. These talk to Clerk's
// Backend API with CLERK_SECRET_KEY to mint a real session — they do
// NOT mock auth. The post-login app code path runs exactly as in prod.
import { addClerkCommands } from '@clerk/testing/cypress';
addClerkCommands({ Cypress, cy });

// Upstream Clerk + React 19 rendering quirk: <SignInButton> throws
// "You've passed multiple children components" during some re-mounts even
// though [header.tsx](../../src/components/header/header.tsx) passes a single
// child. It does NOT affect auth behavior — every auth spec passes. We ignore
// ONLY this specific third-party error so it can't fail unrelated specs.
// TODO(app): fix by upgrading @clerk/nextjs or reworking the SignInButton child.
Cypress.on('uncaught:exception', (err) => {
    if (/SignInButton/.test(err.message) && /multiple children/i.test(err.message)) {
        return false;
    }
    // Let all other errors fail the test (default behavior).
    return undefined;
});
