describe('File Upload Tests', () => {
    const projectName = `Upload Test ${Date.now()}`;

    beforeEach(() => {
        cy.login();
        cy.deleteAllProjects();
        cy.clearDatabase();

        // Manual project creation since custom command doesn't exist
        cy.visit('/projects');
        cy.get('[data-testid="add-project-button"]', { timeout: 15000 }).should('be.visible').click();
        cy.get('[data-testid="project-name-input"]').should('be.visible').type(projectName);
        cy.get('[data-testid="create-project-submit"]').should('be.visible').click();

        cy.contains(projectName, { timeout: 15000 }).should('be.visible').click();
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="close-tutorial"]').length > 0) {
                cy.get('[data-testid="close-tutorial"]').click();
            }
        });

        // Create a column to enable "Scan Files"
        cy.contains('button', 'Add Column').click();
        cy.get('[data-testid="column-name-input"]').should('be.visible').type('Files{enter}');
        cy.contains('Files', { timeout: 10000 }).should('be.visible');
    });

    it('should upload a single file via dropzone', () => {
        // Intercept upload to verify network call
        cy.intercept('PUT', '**/upload/**').as('s3Upload');

        // Open Scan Files modal (target visible desktop button)
        cy.get('[data-testid="scan-files-button"]').filter(':visible').should('be.visible').click();

        // Locate dropzone and attach file
        cy.get('[data-testid="single-dropzone"]').should('be.visible');
        cy.get('input[data-testid="file-input"]').selectFile('cypress/fixtures/sample-1.pdf', { force: true });

        // Verify processing UI
        cy.contains('Processing', { timeout: 10000 }).should('be.visible');

        // Wait for upload and processing completion
        cy.wait('@s3Upload');

        // Verify file appears in the table
        cy.contains('sample-1.pdf', { timeout: 30000 }).should('be.visible');
        cy.get('[data-testid^="record-row-"]').should('have.length', 1);
    });

    it('should upload multiple files (bulk upload)', () => {
        cy.intercept('PUT', '**/upload/**').as('s3Upload');

        const files = [
            'cypress/fixtures/sample-1.pdf',
            'cypress/fixtures/invoice.png'
        ];

        // Open Scan Files modal (target visible desktop button)
        cy.get('[data-testid="scan-files-button"]').filter(':visible').should('be.visible').click();

        // Switch to Bulk Upload tab
        cy.get('[data-testid="bulk-upload-tab"]').should('be.visible').click();

        cy.get('[data-testid="bulk-dropzone"]').should('be.visible');
        cy.get('input[data-testid="bulk-file-input"]').selectFile(files, { force: true });

        // Verify multiple processing indicators or generic status
        cy.contains('Uploading', { timeout: 10000 }).should('be.visible');

        // Wait for uploads (rough wait or explicit alias wait)
        cy.wait('@s3Upload');

        // Final verification
        cy.get('body').click(0, 0); // Close modal if needed, or wait for auto-close
        cy.contains('sample-1.pdf', { timeout: 60000 }).should('be.visible');
        cy.contains('invoice.png', { timeout: 60000 }).should('be.visible');
        cy.get('[data-testid^="record-row-"]').should('have.length', 2);
    });
});
