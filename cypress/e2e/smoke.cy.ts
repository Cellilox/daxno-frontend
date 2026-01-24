describe('Smoke Test - Connectivity', () => {
    it('should load the home page (unauthenticated)', () => {
        cy.visit('/');
        // Check if we see the Welcome or Clerk Sign In (redirect)
        // Since we aren't logged in, it should redirect to /sign-in or show Clerk components
        cy.url().should('include', 'sign-in');
    });
});
