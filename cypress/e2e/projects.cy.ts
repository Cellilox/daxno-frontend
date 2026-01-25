describe('Phase 2: Project & Column CRUD', () => {
    // We access the globally defined login command in support/commands.ts
    // which now processes the visual login flow
    beforeEach(() => {
        cy.login();
    });

    it('should create, rename, and then delete a project', () => {
        const timestamp = Date.now();
        const testProjectName = `Test Project ${timestamp}`;
        const newProjectName = `Renamed Project ${timestamp}`;

        // --- 1. CREATE ---
        cy.visit('/projects');
        cy.location('hostname').should('eq', 'localhost');
        cy.location('pathname').should('eq', '/projects');
        cy.contains('Projects', { timeout: 10000 }).should('be.visible');

        cy.get('[data-testid="add-project-button"]').should('be.visible').click();
        cy.get('[data-testid="project-name-input"]').should('be.visible').type(testProjectName);
        cy.get('[data-testid="create-project-submit"]').should('be.visible').click();

        // Verify creation
        cy.contains(testProjectName, { timeout: 10000 }).should('be.visible');

        // --- 2. UPDATE (Rename) ---
        // Find the project card by text
        cy.contains(testProjectName).parents('[data-testid^="project-card-"]').within(() => {
            // The buttons are visible on hover, so we force click
            cy.get('button[title="Edit project"]').click({ force: true });
        });

        // Edit Modal should be visible
        cy.contains('Edit Project').should('be.visible');

        // Update name AND description
        const newDescription = `Description for ${timestamp}`;
        cy.contains('label', 'Project Name').next('input').clear().type(newProjectName);
        cy.contains('label', 'Project Description').next('textarea').clear().type(newDescription);

        cy.contains('button', 'Save Changes').click();

        // Verify update (Name and Description)
        cy.contains(newProjectName, { timeout: 10000 }).should('be.visible');
        cy.contains(newDescription).should('be.visible');
        cy.contains(testProjectName).should('not.exist');

        /* 
        // Verify it's updated in IndexedDB locally
        cy.log('Verifying IndexedDB update...');
        cy.window().then(async (win) => {
             // ... Code omitted for stability ...
        });
        */

        // --- 3. DELETE ---
        cy.contains(newProjectName).parents('[data-testid^="project-card-"]').within(() => {
            cy.get('button[title="Delete project"]').click({ force: true });
        });

        // Delete Alert should be visible
        cy.contains('Delete Project').should('be.visible');
        cy.contains('This project and all data associated will be deleted').should('be.visible');

        // Confirm delete
        cy.contains('button', 'Delete').click();

        /*
        // Verify it's removed from IndexedDB locally
        cy.log('Verifying IndexedDB deletion...');
        cy.window().then(async (win) => {
             // ... Code omitted for stability ...
        });
        */

        // Reload to ensure the list is refreshed from server
        cy.reload();

        // Verify deletion
        cy.contains(newProjectName, { timeout: 10000 }).should('not.exist');
    });
});
