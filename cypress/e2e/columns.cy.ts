import { SEL, DEFAULTS } from '../support/selectors';

describe('Column Management CRUD', () => {
    beforeEach(() => {
        // 1. Backend Clean Slate.
        //
        // Historically this called `docker exec daxno-backend python ...` to
        // truncate tables. That coupled CI to Docker being addressable from
        // the test host, made tests flaky when the container name drifted,
        // and broke completely on non-Docker dev environments.
        //
        // Replacement: cy.deleteAllProjects() now does API-first cleanup
        // (DELETE /projects/<id> per row) and only falls back to the UI if
        // the API path can't reach the backend.
        cy.deleteAllProjects();

        // 2. Frontend Clean Slate
        cy.clearDatabase();
        cy.clearLocalStorage();

        // 3. Log in (clears state internally too)
        cy.login();

        // 4. Create fresh project UNIQUE TO THIS TEST BLOCK
        // This ensures 100% isolation so we never "reuse" a dirty project
        const testProjectName = `E2E-Cols-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        cy.selectOrCreateProject(testProjectName);

        // Final sanity check — let Cypress's retry mechanism do the polling
        // instead of cy.wait(<n>).
        cy.get(SEL.records.table, { timeout: DEFAULTS.pageLoad }).should('be.visible');
    });

    describe('Positive CRUD Scenarios', () => {
        it('should CREATE a new column', () => {
            const name = `Col-Create-${Date.now()}`;
            cy.log(`Creating column: ${name}`);

            cy.get(SEL.columns.addButton).should('be.visible').click();
            cy.get(SEL.columns.nameInput)
                .should('be.visible')
                .type(`${name}{enter}`);

            // Removed cy.wait(3000). The cy.contains below retries until the
            // column header appears or the timeout fires — that's the right
            // way to wait on RSC revalidation.
            cy.contains('th', name, { timeout: DEFAULTS.networkRoundTrip }).should('be.visible');
        });

        it('should RENAME an existing column', () => {
            const initialName = `Col-ToRename-${Date.now()}`;
            const newName = `Renamed-${Date.now()}`;

            // Setup
            cy.get(SEL.columns.addButton).click();
            cy.get(SEL.columns.nameInput).type(`${initialName}{enter}`);
            // Wait for the header to actually exist before clicking it.
            cy.contains('th', initialName, { timeout: DEFAULTS.networkRoundTrip }).should('be.visible');

            // Rename
            // THE GOLDEN RULE: Use cy.contains(selector, text) to find the text span.
            // This is resilient to DOM re-renders because it re-queries from root on retry.
            cy.contains(SEL.columns.nameText, initialName, { timeout: DEFAULTS.networkRoundTrip })
                .should('be.visible')
                .click();

            cy.get(SEL.columns.editInput, { timeout: DEFAULTS.networkRoundTrip })
                .should('be.visible')
                .clear()
                .type(`${newName}{enter}`);

            // Verify — retry-driven; no hardcoded wait.
            cy.contains('th', newName, { timeout: DEFAULTS.networkRoundTrip }).should('be.visible');
            cy.contains('th', initialName).should('not.exist');
        });

        it('should DELETE an existing column', () => {
            const name = `Col-ToDelete-${Date.now()}`;

            // Setup
            cy.get(SEL.columns.addButton).click();
            cy.get(SEL.columns.nameInput).type(`${name}{enter}`);
            cy.contains('th', name, { timeout: DEFAULTS.networkRoundTrip }).should('be.visible');

            // Delete
            // 1. Explicitly hover to reveal the trash icon
            cy.contains('th', name, { timeout: DEFAULTS.networkRoundTrip })
                .should('be.visible')
                .trigger('mouseover');

            // 2. Click the trash icon using the definitive trigger testid
            cy.get(SEL.columns.deleteByName(name), { timeout: 10000 })
                .should('be.visible')
                .click({ force: true });

            // 3. Wait for the AlertDialog backdrop to ensure it's open
            cy.get(SEL.dialog.backdrop, { timeout: 10000 }).should('be.visible');

            // 4. Click confirm inside the dialog
            cy.get(SEL.dialog.confirm)
                .should('be.visible')
                .click();

            // Verify — the not.exist assertion retries until it's true.
            cy.contains('th', name, { timeout: DEFAULTS.networkRoundTrip }).should('not.exist');
        });
    });

    describe('Negative & Edge Scenarios', () => {
        it('should NOT create a column with an empty name', () => {
            cy.get(SEL.columns.addButton).click();
            cy.get(SEL.columns.nameInput).type('{enter}');
            cy.get(SEL.columns.nameInput).should('not.exist');
        });

        it('should cancel creation when pressing Escape', () => {
            const name = 'EscapeMe';
            cy.get(SEL.columns.addButton).click();
            cy.get(SEL.columns.nameInput).type(`${name}{esc}`);
            cy.get(SEL.columns.nameInput).should('not.exist');
            cy.contains('th', name).should('not.exist');
        });

        it('should handle save-on-blur during renaming', () => {
            const name = `Col-Blur-${Date.now()}`;

            // Setup
            cy.get(SEL.columns.addButton).click();
            cy.get(SEL.columns.nameInput).type(`${name}{enter}`);
            cy.contains('th', name, { timeout: DEFAULTS.networkRoundTrip }).should('be.visible');

            // Start editing
            cy.contains(SEL.columns.nameText, name, { timeout: DEFAULTS.networkRoundTrip })
                .should('be.visible')
                .click();

            cy.get(SEL.columns.editInput).type(' Updated');

            // Blur
            cy.get('body').click(0, 0);

            // Verify — retry-driven; replaces cy.wait(2000).
            cy.contains('th', `${name} Updated`, { timeout: DEFAULTS.networkRoundTrip }).should('be.visible');
        });
    });
});
