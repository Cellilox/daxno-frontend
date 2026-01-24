declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to login via Clerk session injection
         * @example cy.login()
         */
        login(): Chainable<void>;
        /**
         * Simulates offline mode
         */
        goOffline(): Chainable<void>;
        /**
         * Simulates online mode
         */
        goOnline(): Chainable<void>;
    }
}
