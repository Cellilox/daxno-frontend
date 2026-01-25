describe('Realistic Columns & Records CRUD (Dual PDF)', () => {
    const testProjectName = 'E2E-Workspace';
    let testProjectId: string;

    before(() => {
        cy.login();
        cy.log(`Navigating to project dashboard...`);
        cy.visit('/projects');
        cy.selectOrCreateProject(testProjectName);

        // Extract project ID from URL for cleanup later
        cy.url().then((url) => {
            testProjectId = url.split('/').pop() || '';
            cy.log(`Active project ID: ${testProjectId}`);
        });
    });

    it('Step 1: Verify correctly reached project details page', () => {
        cy.location('hostname').should('eq', 'localhost');
        cy.location('pathname').should('include', '/projects/');

        // Use the LIVE indicator as requested by the user
        cy.get('[data-testid="status-online"]', { timeout: 15000 })
            .should('be.visible')
            .and('contain', 'Live');

        cy.log('✅ Successfully reached project details page (Connection is LIVE)');
    });

    describe('Step 2: Realistic Column Management', () => {
        const columns = ['Invoice Number', 'Vendor Name', 'Total Amount'];

        it('should create realistic invoice columns', () => {
            columns.forEach((col, index) => {
                cy.log(`Creating column: ${col}`);
                cy.get('[data-testid="add-column-button"]', { timeout: 15000 }).should('be.visible').click();
                cy.get('[data-testid="column-name-input"]', { timeout: 5000 }).should('be.visible').type(`${col}{enter}`);

                // Confirm creation in header
                cy.contains('th', col, { timeout: 10000 }).should('be.visible');
            });
        });

        it('should rename "Total Amount" to "Invoice Total"', () => {
            // Find the specific column header
            cy.contains('th', 'Total Amount').should('be.visible').click();
            // The input appears inside the th when clicked (editing mode)
            cy.get('th').contains('Total Amount').parent().find('input').clear().type('Invoice Total{enter}');
            cy.contains('th', 'Invoice Total').should('be.visible');
        });
    });

    describe('Step 3: Dual PDF Extraction Testing', () => {

        beforeEach(() => {
            // Ensure table is visible and stable
            cy.get('[data-testid="records-table"]', { timeout: 10000 }).should('exist');
        });

        it('Scenario 1: Upload and verify Text-based PDF (sample-1.pdf)', () => {
            cy.log('Starting Scenario 1...');
            cy.get('button').contains('Scan Files').click();

            // Wait for modal and select file
            cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/sample-1.pdf', { force: true });
            cy.contains('sample-1.pdf').should('be.visible');

            cy.intercept('POST', '**/records/upload*').as('uploadText');
            cy.intercept('POST', '**/records/query-doc*').as('analysisText');

            cy.get('[data-testid="start-upload-button"]').click();

            cy.wait('@uploadText', { timeout: 30000 });
            cy.wait('@analysisText', { timeout: 60000 });

            // Verify row and extraction using data-testids
            cy.get('[data-testid="record-row-0"]', { timeout: 30000 }).should('be.visible');
            cy.get('[data-testid="record-filename-0"]').should('contain', 'sample-1.pdf');

            // Expected values from the invoice
            cy.get('[data-testid="record-row-0"]').within(() => {
                cy.contains('INV-2025-001').should('be.visible');
                cy.contains('ABC Company Ltd.').should('be.visible');
                cy.contains('10,098.00').should('be.visible');
            });
        });

        it('Scenario 2: Upload and verify Image-based PDF (image-convered-pdf.pdf)', () => {
            cy.log('Starting Scenario 2...');
            cy.get('button').contains('Scan Files').click();
            cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/image-convered-pdf.pdf', { force: true });

            cy.intercept('POST', '**/records/upload*').as('uploadImg');
            cy.intercept('POST', '**/records/query-doc*').as('analysisImg');

            cy.get('[data-testid="start-upload-button"]').click();

            cy.wait('@uploadImg', { timeout: 30000 });
            cy.wait('@analysisImg', { timeout: 60000 });

            // Find the specific row for this file (it might be the first or second)
            cy.contains('[data-testid^="record-row-"]', 'image-convered-pdf.pdf', { timeout: 30000 }).within(() => {
                cy.contains('INV-2025-001').should('be.visible');
                cy.contains('ABC Company Ltd.').should('be.visible');
                cy.contains('10,098.00').should('be.visible');
            });
        });
    });

    describe('Step 4: Record Post-cleanup', () => {
        it('should delete the test records', () => {
            // Check the master checkbox in header
            cy.get('thead th input[type="checkbox"]').check();

            // Bulk delete bar should appear
            cy.get('button').contains('Delete').click();

            // Alert dialog confirmation
            cy.contains('button', 'Delete All').click();

            // All rows should be gone
            cy.get('[data-testid^="record-row-"]').should('not.exist');
        });
    });

    after(() => {
        // Cleanup Project if we created it
        if (testProjectId) {
            cy.visit('/projects');
            cy.get(`[data-testid="project-card-${testProjectId}"]`).within(() => {
                cy.get('button[title="Delete project"]').click({ force: true });
            });
            cy.get('button').contains('Delete').click();
            cy.contains(testProjectName).should('not.exist');
        }
    });
});
