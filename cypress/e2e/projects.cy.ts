describe('Phase 2: Projects CRUD', () => {
    beforeEach(() => {
        cy.login();
        // Ensure atomic isolation for each test
        cy.deleteAllProjects();
        cy.clearDatabase();
    });

    it('should create a new project', () => {
        const testProjectName = `Create Project ${Date.now()}`;

        cy.visit('/agents');
        cy.get('[data-testid="add-project-button"]', { timeout: 15000 }).should('be.visible').click();
        // Switch from document-type picker to the custom name-entry form
        cy.contains('button', 'Custom').click();
        cy.get('[data-testid="project-name-input"]').should('be.visible').type(testProjectName);
        cy.get('[data-testid="create-project-submit"]').should('be.visible').click();

        // The agent-creation loader plays ~5s, then auto-navigates to /agents/{id}.
        // The agent name shows in the detail-page heading.
        cy.location('pathname', { timeout: 25000 }).should('include', '/agents/');
        cy.contains(testProjectName, { timeout: 15000 }).should('be.visible');
    });

    it('should rename an existing project', () => {
        const timestamp = Date.now();
        const initialName = `Initial Project ${timestamp}`;
        const newName = `Renamed Project ${timestamp}`;
        const newDescription = `Description for ${timestamp}`;

        // Setup: Create a project first (auto-navigates to detail page)
        cy.visit('/agents');
        cy.get('[data-testid="add-project-button"]').click();
        cy.contains('button', 'Custom').click();
        cy.get('[data-testid="project-name-input"]').type(initialName);
        cy.get('[data-testid="create-project-submit"]').click();
        cy.location('pathname', { timeout: 25000 }).should('include', '/agents/');

        // Return to the list to interact with the card
        cy.visit('/agents');
        cy.contains(initialName, { timeout: 10000 }).should('be.visible');

        // Rename
        cy.contains(initialName).parents('[data-testid^="project-card-"]').within(() => {
            cy.get('button[title="Edit agent"]').click({ force: true });
        });

        cy.contains('Edit Agent').should('be.visible');
        cy.contains('label', 'Agent Name').next('input').clear().type(newName);
        cy.contains('label', 'Agent Description').next('textarea').clear().type(newDescription);
        cy.contains('button', 'Save Changes').click();

        // Verify update
        cy.contains(newName, { timeout: 10000 }).should('be.visible');
        cy.contains(newDescription).should('be.visible');
        cy.contains(initialName).should('not.exist');
    });

    it('should delete an existing project', () => {
        const testProjectName = `Delete Project ${Date.now()}`;

        // Setup: Create a project first (auto-navigates to detail page)
        cy.visit('/agents');
        cy.get('[data-testid="add-project-button"]').click();
        cy.contains('button', 'Custom').click();
        cy.get('[data-testid="project-name-input"]').type(testProjectName);
        cy.get('[data-testid="create-project-submit"]').click();
        cy.location('pathname', { timeout: 25000 }).should('include', '/agents/');

        // Return to the list to interact with the card
        cy.visit('/agents');
        cy.contains(testProjectName, { timeout: 10000 }).should('be.visible');

        // Delete
        cy.contains(testProjectName).parents('[data-testid^="project-card-"]').within(() => {
            cy.get('button[title="Delete agent"]').click({ force: true });
        });

        cy.contains('Delete Agent').should('be.visible');
        cy.contains('button', 'Delete').click();

        // Verify deletion
        cy.reload();
        cy.contains(testProjectName, { timeout: 15000 }).should('not.exist');
    });
});
