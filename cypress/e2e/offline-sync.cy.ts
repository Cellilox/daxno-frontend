describe('Phase 4: Offline Mode & IndexedDB Sync', () => {
    beforeEach(() => {
        // MUST reset network to online at the start of every test
        // since CDP state persists across specs!
        cy.goOnline();

        // Ignore expected errors during offline tests
        cy.on('uncaught:exception', (err) => {
            const ignoredErrors = [
                'Failed to fetch',
                'Load chunk',
                'Minified React error #418',
                'Minified React error #423',
                'Minified React error #425',
                'hydrat',
                'matching'
            ];
            if (ignoredErrors.some(msg => err.message.includes(msg))) {
                return false;
            }
        });

        cy.login();
        // Clear everything for a clean state
        cy.deleteAllProjects();
        cy.clearDatabase();
    });

    it('should show offline status when network is disconnected', () => {
        cy.visit('/projects');
        cy.contains('Projects', { timeout: 15000 }).should('be.visible');

        cy.goOffline();

        // Verify offline indicator appears
        cy.contains('Offline', { timeout: 15000 }).should('be.visible');

        cy.goOnline();
        cy.contains('Offline', { timeout: 10000 }).should('not.exist');
    });

    it('should queue file uploads to IndexedDB when offline', () => {
        const projectName = `OfflineSync-${Date.now()}`;
        cy.selectOrCreateProject(projectName);

        // Wait for page to settle
        cy.get('[data-testid="project-details-title"]', { timeout: 30000 }).should('be.visible');

        cy.goOffline();

        // Trigger the upload modal (using force click because of potential blur-sm overlays)
        cy.get('button', { timeout: 20000 })
            .filter(':contains("Scan Files")')
            .filter(':visible')
            .first()
            .click({ force: true });

        const fileName = 'offline-test.pdf';
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('mock pdf content'),
            fileName: fileName,
        }, { force: true });

        cy.get('[data-testid="start-upload-button"]').click({ force: true });

        // The UI should show the sync banner
        cy.get('[data-testid="sync-banner"]', { timeout: 15000 }).should('be.visible');
        cy.contains(/Waiting for connection|Offline/i).should('be.visible');

        // Go back online and verify it syncs
        cy.goOnline();

        // Wait for sync to complete
        cy.contains('Syncing', { timeout: 20000 }).should('be.visible');
        cy.contains('Sync Complete', { timeout: 45000 }).should('be.visible');
    });

    it('should persist cached records from IndexedDB when reloading offline', () => {
        const projectName = `OfflineCache-${Date.now()}`;
        cy.selectOrCreateProject(projectName);

        // Wait for records to appear and be cached
        cy.get('[data-testid="records-table"]', { timeout: 30000 }).should('be.visible');
        cy.wait(3000); // Give IndexedDB time to settle

        cy.goOffline();
        cy.reload();

        // Ignore hydration errors that might pop up during offline reload
        cy.contains(projectName, { timeout: 20000 }).should('be.visible');
        cy.get('[data-testid="records-table"]').should('be.visible');
    });

    it('should sync record deletions from IndexedDB cache', () => {
        const projectName = `OfflineDelete-${Date.now()}`;
        cy.selectOrCreateProject(projectName);

        cy.get('[data-testid="project-details-title"]', { timeout: 30000 }).should('be.visible');

        // Ensure we have at least one record
        cy.get('button').filter(':contains("Scan Files")').filter(':visible').first().click({ force: true });

        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('pdf'),
            fileName: 'delete-me.pdf',
        }, { force: true });

        cy.get('[data-testid="start-upload-button"]').should('exist').click({ force: true });

        // Wait for upload to complete and row to appear
        cy.get('[data-testid^="record-row-"]', { timeout: 40000 }).should('have.length.at.least', 1);

        cy.goOffline();

        // Delete record offline
        // Find any delete button in the row (mobile or desktop)
        cy.get('[data-testid="record-row-0"]')
            .find('button')
            .filter((i, el) => {
                const title = el.getAttribute('title') || '';
                return title.toLowerCase().includes('delete');
            })
            .first()
            .click({ force: true });
        cy.get('[data-testid="alert-dialog-confirm"]').click({ force: true });

        // Optimistic UI check
        cy.get('[data-testid="record-row-0"]', { timeout: 10000 }).should('not.exist');

        cy.goOnline();
        // Backend sync check
        cy.contains('Sync Complete', { timeout: 30000 }).should('be.visible');
        cy.get('[data-testid="record-row-0"]').should('not.exist');
    });
});
