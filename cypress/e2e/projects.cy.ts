describe('Project Lifecycle', () => {
    beforeEach(() => {
        // Step 3: Use our custom login command
        cy.login();
    });

    it('should display the projects dashboard', () => {
        // Assert we are on the projects page
        cy.url().should('include', '/projects');

        // Check for the "Add Project" button using our new data-testid
        cy.get('[data-testid="add-project-button"]').should('be.visible');
    });
});
