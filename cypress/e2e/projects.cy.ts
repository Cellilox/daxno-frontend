describe('Phase 2: Projects CRUD', () => {
    beforeEach(() => {
        cy.login();
        // Ensure atomic isolation for each test
        cy.deleteAllProjects();
        cy.clearDatabase();
    });

    it('should create a new project', () => {
        const testProjectName = `Create Project ${Date.now()}`;

        cy.visit('/projects');
        cy.get('[data-testid="add-project-button"]', { timeout: 15000 }).should('be.visible').click();
        cy.get('[data-testid="project-name-input"]').should('be.visible').type(testProjectName);
        cy.get('[data-testid="create-project-submit"]').should('be.visible').click();

        // Verify creation
        cy.contains(testProjectName, { timeout: 15000 }).should('be.visible');
    });

    it('should rename an existing project', () => {
        const timestamp = Date.now();
        const initialName = `Initial Project ${timestamp}`;
        const newName = `Renamed Project ${timestamp}`;
        const newDescription = `Description for ${timestamp}`;

        // Setup: Create a project first
        cy.visit('/projects');
        cy.get('[data-testid="add-project-button"]').click();
        cy.get('[data-testid="project-name-input"]').type(initialName);
        cy.get('[data-testid="create-project-submit"]').click();
        cy.contains(initialName, { timeout: 10000 }).should('be.visible');

        // Rename
        cy.contains(initialName).parents('[data-testid^="project-card-"]').within(() => {
            cy.get('button[title="Edit project"]').click({ force: true });
        });

        cy.contains('Edit Project').should('be.visible');
        cy.contains('label', 'Project Name').next('input').clear().type(newName);
        cy.contains('label', 'Project Description').next('textarea').clear().type(newDescription);
        cy.contains('button', 'Save Changes').click();

        // Verify update
        cy.contains(newName, { timeout: 10000 }).should('be.visible');
        cy.contains(newDescription).should('be.visible');
        cy.contains(initialName).should('not.exist');
    });

    it('should delete an existing project', () => {
        const testProjectName = `Delete Project ${Date.now()}`;

        // Setup: Create a project first
        cy.visit('/projects');
        cy.get('[data-testid="add-project-button"]').click();
        cy.get('[data-testid="project-name-input"]').type(testProjectName);
        cy.get('[data-testid="create-project-submit"]').click();
        cy.contains(testProjectName, { timeout: 10000 }).should('be.visible');

        // Delete
        cy.contains(testProjectName).parents('[data-testid^="project-card-"]').within(() => {
            cy.get('button[title="Delete project"]').click({ force: true });
        });

        cy.contains('Delete Project').should('be.visible');
        cy.contains('button', 'Delete').click();

        // Verify deletion
        cy.reload();
        cy.contains(testProjectName, { timeout: 15000 }).should('not.exist');
    });
});
