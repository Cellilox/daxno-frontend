declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to bypass Clerk login and authenticate user
         * @example cy.login()
         */
        login(): Chainable<void>;

        /**
         * Custom command to simulate offline network state
         * @example cy.goOffline()
         */
        goOffline(): Chainable<void>;

        /**
         * Custom command to restore online network state
         * @example cy.goOnline()
         */
        goOnline(): Chainable<void>;

        /**
         * Custom command to clear all IndexedDB instances for a fresh start
         * @example cy.clearDatabase()
         */
        clearDatabase(): Chainable<void>;

        /**
         * Custom command to clear IndexedDB for testing
         * @example cy.clearIndexedDB()
         */
        clearIndexedDB(): Chainable<void>;

        /**
         * Custom command to inspect IndexedDB data
         * @example cy.inspectIndexedDB('project-123')
         */
        inspectIndexedDB(projectId: string): Chainable<any>;

        /**
         * Custom command to upload a file
         * @example cy.uploadFile('test-document.pdf')
         */
        uploadFile(filename: string): Chainable<void>;

        /**
         * Custom command to wait for file processing to complete
         * @example cy.waitForProcessing()
         */
        waitForProcessing(timeout?: number): Chainable<void>;

        /**
         * Custom command to select an existing project or create one
         * @example cy.selectOrCreateProject('E2E Test')
         */
        selectOrCreateProject(projectName: string): Chainable<void>;

        /**
         * Custom command to delete ALL projects for the test account
         * @example cy.deleteAllProjects()
         */
        deleteAllProjects(): Chainable<void>;

        /**
         * Login as a specific Clerk test role: 'owner' (default), 'invitee', or 'admin'.
         * Each role keeps its own cy.session() cache, so switching mid-test is cheap.
         * Credentials are read from cypress.env.json
         * (CLERK_TEST_EMAIL/PASSWORD, CLERK_INVITEE_EMAIL/PASSWORD, CLERK_ADMIN_EMAIL/PASSWORD).
         */
        loginAs(role?: 'owner' | 'invitee' | 'admin'): Chainable<void>;

        /**
         * Create a project via the backend API (skips UI). Returns the created project id.
         * @example cy.apiCreateProject('Spec Setup').then(id => ...)
         */
        apiCreateProject(name: string): Chainable<string>;

        /**
         * Upload a fixture file directly via the backend API. Returns the record id.
         * @example cy.apiUploadRecord(projectId, 'sample-1.pdf').then(recordId => ...)
         */
        apiUploadRecord(projectId: string, fixture: string): Chainable<string>;

        /**
         * Create an invite for a project and return the invite token.
         * @example cy.apiCreateInvite(projectId, 'invitee@example.com').then(token => ...)
         */
        apiCreateInvite(projectId: string, email: string): Chainable<string>;

        /**
         * Create a field/column on a project via the backend API. Returns the field id.
         * Needed to un-blur the secondary actions (Share/Invite/Onyx/Model picker),
         * which are pointer-events-none until the agent has >= 1 column.
         * @example cy.apiCreateField(projectId, 'Amount')
         */
        apiCreateField(projectId: string, name: string): Chainable<string>;

        /**
         * Poll the backend for record extraction completion (status === 'complete').
         * Throws if the timeout is exceeded.
         * @example cy.waitForExtractionComplete(recordId, 60000)
         */
        waitForExtractionComplete(recordId: string, timeout?: number): Chainable<void>;
    }
}
