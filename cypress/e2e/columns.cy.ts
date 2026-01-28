describe('Column Management CRUD', () => {
    beforeEach(() => {
        // 1. Backend Clean Slate: Nuclear Truncation
        // Using direct --force without pipes as the script supports it natively
        cy.exec('docker exec daxno-backend python src/scripts/maintenance/truncate_all_tables.py --force', { failOnNonZeroExit: false })
            .then((result) => {
                if (result.code !== 0) {
                    cy.log('⚠️ Backend truncation warning/failure. Check logs.', result.stderr);
                } else {
                    cy.log('✅ Backend tables truncated');
                }
            });

        // 2. Frontend Clean Slate
        cy.clearDatabase();
        cy.clearLocalStorage();

        // 3. Log in (clears state internally too)
        cy.login();

        // 4. Create fresh project UNIQUE TO THIS TEST BLOCK
        // This ensures 100% isolation so we never "reuse" a dirty project
        const testProjectName = `E2E-Cols-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        cy.selectOrCreateProject(testProjectName);

        // Final sanity check
        cy.get('[data-testid="records-table"]', { timeout: 30000 }).should('be.visible');
    });

    describe('Positive CRUD Scenarios', () => {
        it('should CREATE a new column', () => {
            const name = `Col-Create-${Date.now()}`;
            cy.log(`Creating column: ${name}`);

            cy.get('[data-testid="add-column-button"]').should('be.visible').click();
            cy.get('[data-testid="column-name-input"]')
                .should('be.visible')
                .type(`${name}{enter}`);

            // Wait for RSC revalidation and Verify
            cy.wait(3000);
            cy.contains('th', name, { timeout: 15000 }).should('be.visible');
        });

        it('should RENAME an existing column', () => {
            const initialName = `Col-ToRename-${Date.now()}`;
            const newName = `Renamed-${Date.now()}`;

            // Setup
            cy.get('[data-testid="add-column-button"]').click();
            cy.get('[data-testid="column-name-input"]').type(`${initialName}{enter}`);
            cy.wait(3000);

            // Rename
            // THE GOLDEN RULE: Use cy.contains(selector, text) to find the text span.
            // This is resilient to DOM re-renders because it re-queries from root on retry.
            cy.contains('[data-testid="column-name-text"]', initialName, { timeout: 15000 })
                .should('be.visible')
                .click();

            cy.get('[data-testid="column-edit-input"]', { timeout: 15000 })
                .should('be.visible')
                .clear()
                .type(`${newName}{enter}`);

            // Verify
            cy.wait(3000);
            cy.contains('th', newName, { timeout: 15000 }).should('be.visible');
            cy.contains('th', initialName).should('not.exist');
        });

        it('should DELETE an existing column', () => {
            const name = `Col-ToDelete-${Date.now()}`;

            // Setup
            cy.get('[data-testid="add-column-button"]').click();
            cy.get('[data-testid="column-name-input"]').type(`${name}{enter}`);
            cy.wait(3000);

            // Delete
            // 1. Explicitly hover to reveal the trash icon
            cy.contains('th', name, { timeout: 15000 })
                .should('be.visible')
                .trigger('mouseover');

            // 2. Click the trash icon using the definitive trigger testid
            cy.get(`[data-testid="delete-column-${name}"]`, { timeout: 10000 })
                .should('be.visible')
                .click({ force: true });

            // 3. Wait for the AlertDialog backdrop to ensure it's open
            cy.get('[data-testid="alert-dialog-backdrop"]', { timeout: 10000 }).should('be.visible');

            // 4. Click confirm inside the dialog
            cy.get('[data-testid="alert-dialog-confirm"]')
                .should('be.visible')
                .click();

            // Verify
            cy.wait(3000);
            cy.contains('th', name).should('not.exist');
        });
    });

    describe('Negative & Edge Scenarios', () => {
        it('should NOT create a column with an empty name', () => {
            cy.get('[data-testid="add-column-button"]').click();
            cy.get('[data-testid="column-name-input"]').type('{enter}');
            cy.get('[data-testid="column-name-input"]').should('not.exist');
        });

        it('should cancel creation when pressing Escape', () => {
            const name = 'EscapeMe';
            cy.get('[data-testid="add-column-button"]').click();
            cy.get('[data-testid="column-name-input"]').type(`${name}{esc}`);
            cy.get('[data-testid="column-name-input"]').should('not.exist');
            cy.contains('th', name).should('not.exist');
        });

        it('should handle save-on-blur during renaming', () => {
            const name = `Col-Blur-${Date.now()}`;

            // Setup
            cy.get('[data-testid="add-column-button"]').click();
            cy.get('[data-testid="column-name-input"]').type(`${name}{enter}`);
            cy.wait(3000);

            // Start editing
            cy.contains('[data-testid="column-name-text"]', name, { timeout: 15000 })
                .should('be.visible')
                .click();

            cy.get('[data-testid="column-edit-input"]').type(' Updated');

            // Blur
            cy.get('body').click(0, 0);

            // Verify
            cy.wait(2000);
            cy.contains('th', `${name} Updated`, { timeout: 15000 }).should('be.visible');
        });
    });
});
