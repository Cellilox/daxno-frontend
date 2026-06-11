describe('Phase 1: Authentication & Page Protection', () => {
    const email = Cypress.env('CLERK_TEST_EMAIL');
    const password = Cypress.env('CLERK_TEST_PASSWORD');

    describe('1. Protected Routes (Unauthenticated)', () => {
        const protectedRoutes = ['/agents', '/admin', '/billing'];

        protectedRoutes.forEach((route) => {
            it(`should redirect from ${route} to Clerk sign-in domain`, () => {
                cy.clearAllCookies();
                cy.visit(route, { failOnStatusCode: false });

                // Should redirect to Clerk domain
                cy.url({ timeout: 20000 }).should('include', 'accounts.dev');
                cy.log(`✅ Successfully redirected from ${route}`);
            });
        });
    });

    describe('2. Visual Login Flow', () => {
        it('should visibly perform the full login interaction', () => {
            cy.login();

            // Explicitly visit projects after login/restore
            cy.visit('/agents');
            cy.location('hostname').should('eq', 'localhost');
            cy.location('pathname').should('eq', '/agents');
            cy.contains('Agents', { timeout: 10000 }).should('be.visible');
        });
    });


    describe('3. Authenticated Access', () => {
        beforeEach(() => {
            cy.login();
        });

        it('should allow access to /agents and show agent list', () => {
            cy.visit('/agents');
            cy.location('hostname').should('eq', 'localhost');
            cy.location('pathname').should('eq', '/agents');
            cy.contains('Agents', { timeout: 10000 }).should('be.visible');
            cy.get('[data-testid="add-project-button"]', { timeout: 10000 }).should('exist');
        });

        it('should allow access to other protected areas (Admin/Billing)', () => {
            cy.visit('/admin');
            cy.location('hostname').should('eq', 'localhost');
            // Staying on /admin (not bounced to sign-in or /agents) is the real
            // signal the email-gated admin guard let this user through.
            cy.location('pathname').should('eq', '/admin');
            // Assert the gated <h1>Admin heading specifically — a non-admin is
            // redirected and never renders it — rather than any page-wide text.
            cy.get('h1', { timeout: 15000 }).contains(/Admin/i).should('be.visible');

            cy.visit('/billing');
            cy.location('hostname').should('eq', 'localhost');
            cy.location('pathname').should('eq', '/billing');
            cy.contains(/Billing|Subscription/i, { timeout: 15000 }).should('be.visible');
        });
    });

    describe('4. Logout Flow', () => {
        it('should redirect to sign-in after manual logout', () => {
            cy.login();
            cy.visit('/agents');

            // Trigger Clerk UserButton/Sign out
            // User provided selector: .cl-avatarImage
            cy.get('.cl-avatarImage', { timeout: 15000 }).should('be.visible').click();
            cy.contains('Sign out').should('be.visible').click();

            // Check redirect (might go to home or Clerk sign-in)
            cy.url({ timeout: 15000 }).should('satisfy', (url: string) =>
                url.includes('sign-in') || url.includes('accounts.dev') || url === Cypress.config().baseUrl + '/'
            );
        });
    });
});
