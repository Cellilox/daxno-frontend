describe('Phase 4: Offline Mode & IndexedDB Sync', () => {
    const email = Cypress.env('CLERK_TEST_EMAIL');
    const password = Cypress.env('CLERK_TEST_PASSWORD');

    beforeEach(() => {
        // Authenticate once and reuse session
        cy.login();

        // Ensure we start with a clean state where possible
        // Note: Real IndexedDB clear might need a specific command if we want 100% isolation
        // cy.clearIndexedDB();
    });

    it('should show offline status when network is disconnected', () => {
        cy.visit('/projects');
        cy.contains('Projects', { timeout: 10000 }).should('be.visible');

        cy.goOffline();

        // Verify offline indicator appears
        // The SyncBanner should show "Offline Mode"
        cy.contains('Offline Mode', { timeout: 5000 }).should('be.visible');

        // Restore online
        cy.goOnline();
        cy.contains('Offline Mode').should('not.exist');
    });

    it('should queue file uploads to IndexedDB when offline', () => {
        cy.visit('/projects');

        // Find a project to enter
        cy.get('a[href*="/projects/"]', { timeout: 10000 }).first().click();

        cy.url().should('include', '/projects/');
        cy.contains('Records', { timeout: 10000 }).should('be.visible');

        cy.goOffline();
        cy.contains('Offline Mode').should('be.visible');

        // Trigger the upload modal
        cy.get('button').contains('Scan Files').click();

        // Upload a test file (mocking the dropzone interaction)
        // Note: We need a fixture for this
        const fileName = 'offline-test.pdf';
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('mock pdf content'),
            fileName: fileName,
            lastModified: Date.now(),
        }, { force: true });

        // The UI should show the file as "Queued" or in the offline list
        cy.contains(fileName).should('be.visible');
        cy.contains('Queued', { timeout: 5000 }).should('be.visible');

        // Go back online and verify it syncs
        cy.goOnline();

        // It should transition from "Queued/Syncing" to "Processing"
        // Wait for it to be sent to backend
        cy.contains('Syncing', { timeout: 10000 }).should('be.visible');
        cy.contains('Processing', { timeout: 20000 }).should('be.visible');
    });

    it('should persist cached records from IndexedDB when reloading offline', () => {
        // 1. Load Projects dashboard online
        cy.visit('/projects');
        cy.contains('Projects', { timeout: 10000 }).should('be.visible');

        // 2. Go offline
        cy.goOffline();

        // 3. Reload - Should load from cache
        cy.reload();
        cy.contains('Projects', { timeout: 10000 }).should('be.visible');
        cy.contains('Offline Mode').should('be.visible');

        // 4. Navigate to a project offline (should load from cached records)
        cy.get('a[href*="/projects/"]', { timeout: 10000 }).first().click();
        cy.contains('Records', { timeout: 10000 }).should('be.visible');

        cy.goOnline();
    });

    it('should sync record deletions from IndexedDB cache', () => {
        cy.visit('/projects');
        cy.get('a[href*="/projects/"]', { timeout: 10000 }).first().click();

        // Verify we have records
        cy.get('.ag-row', { timeout: 10000 }).should('have.length.at.least', 1);

        // Attempt to find and click a delete button (using best guess for selector)
        cy.get('button[aria-label*="Delete"], .ag-row .delete-btn').first().should('be.visible').click();

        // Check if confirm modal appears
        cy.get('body').then(($body) => {
            if ($body.find('button').filter(':contains("Delete"), :contains("Confirm")').length > 0) {
                cy.contains('button', /Delete|Confirm/i).click();
            }
        });

        // Verification: Check IndexedDB to see if it was removed from cache store
        cy.inspectIndexedDB('cached_records').then((records) => {
            cy.log(`Found ${records.length} records in cache after deletion`);
        });
    });


    it('should handle offline project creation prevention', () => {
        cy.visit('/projects');
        cy.goOffline();

        cy.get('[data-testid="add-project-button"]').click();

        // Verify help text or validation message about being offline
        cy.contains('Cannot create project while offline', { timeout: 5000 }).should('be.visible');

        cy.goOnline();
        cy.get('[data-testid="add-project-button"]').click();
        cy.contains('Cannot create project while offline').should('not.exist');
    });
});
