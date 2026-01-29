describe('Smoke Test - Connectivity', () => {
    it('should load the home page (unauthenticated)', () => {
        cy.visit('/');
        // Instead of URL redirect, let's look for a Sign in button or welcoming text
        cy.get('body').should('contain', 'Sign in');
    });
});
