describe('Phase 4: Offline Mode & IndexedDB Sync', () => {
    beforeEach(() => {
        cy.login();
        // Clear everything for a clean state
        cy.deleteAllProjects();
        cy.clearDatabase();
    });

    it('should show offline status when network is disconnected', () => {
        cy.visit('/projects');
        cy.contains('Projects', { timeout: 10000 }).should('be.visible');

        cy.goOffline();

        // Verify offline indicator appears
        cy.contains('Offline', { timeout: 10000 }).should('be.visible');

        cy.goOnline();
        cy.contains('Offline').should('not.exist');
    });

    it('should queue file uploads to IndexedDB when offline', () => {
        const projectName = `OfflineSync-${Date.now()}`;
        cy.selectOrCreateProject(projectName);

        cy.goOffline();

        // Trigger the upload modal
        cy.get('button').contains('Scan Files').click();

        const fileName = 'offline-test.pdf';
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('mock pdf content'),
            fileName: fileName,
        }, { force: true });

        cy.get('button').contains('Start Upload').click();

        // The UI should show the sync banner
        cy.get('[data-testid="sync-banner"]').should('be.visible');
        cy.contains('Waiting for connection').should('be.visible');

        // Go back online and verify it syncs
        cy.goOnline();

        // Wait for sync to complete
        cy.contains('Syncing', { timeout: 15000 }).should('be.visible');
        cy.contains('Sync Complete', { timeout: 30000 }).should('be.visible');
    });

    it('should persist cached records from IndexedDB when reloading offline', () => {
        const projectName = `OfflineCache-${Date.now()}`;
        cy.selectOrCreateProject(projectName);

        // Wait for records to appear and be cached
        cy.get('[data-testid="records-table"]', { timeout: 20000 }).should('be.visible');
        cy.wait(2000);

        cy.goOffline();
        cy.reload();

        cy.contains(projectName).should('be.visible');
        cy.get('[data-testid="records-table"]').should('be.visible');
    });

    it('should sync record deletions from IndexedDB cache', () => {
        const projectName = `OfflineDelete-${Date.now()}`;
        cy.selectOrCreateProject(projectName);

        // Ensure we have at least one record
        cy.get('button').contains('Scan Files').click();
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('pdf'),
            fileName: 'delete-me.pdf',
        }, { force: true });
        cy.get('button').contains('Start Upload').click();
        cy.get('[data-testid^="record-row-"]', { timeout: 20000 }).should('have.length.at.least', 1);

        cy.goOffline();

        // Delete record offline
        cy.get('[data-testid="record-row-0"]').trigger('mouseenter');
        cy.get('[data-testid="delete-row-0"]').click();
        cy.contains('button', 'Confirm').click();

        // Optimistic UI check
        cy.get('[data-testid="record-row-0"]').should('not.exist');

        cy.goOnline();
        // Backend sync check
        cy.contains('Sync Complete').should('be.visible');
        cy.get('[data-testid="record-row-0"]').should('not.exist');
    });
});
