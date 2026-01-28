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
    }
}
