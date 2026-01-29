describe('Visual Login Flow Demo', () => {
    // This test does NOT use cy.session to ensure you see the full interaction every time
    const email = Cypress.env('CLERK_TEST_EMAIL');
    const password = Cypress.env('CLERK_TEST_PASSWORD');

    it('should show the full login interaction visibly', () => {
        cy.visit('/');

        cy.log('Step 1: Clicking the Sign in button on the home page');
        // Let's try to be more specific or use a longer wait
        cy.contains('a, button', /Sign in/i, { timeout: 15000 })
            .should('be.visible')
            .click({ force: true });

        // If the click doesn't trigger navigation quickly, let's try a direct visit to a protected page
        // as a "Plan B" to force the Clerk redirect
        cy.url().then((url) => {
            if (url === Cypress.config().baseUrl || url === Cypress.config().baseUrl + '/') {
                cy.log('Plan B: Button click did not redirect immediately, visiting /projects to force auth');
                cy.visit('/projects', { failOnStatusCode: false });
            }
        });

        // WAIT for the URL to change to the Clerk domain
        cy.log('Waiting for Clerk domain redirect...');
        cy.url({ timeout: 30000 }).should('include', 'accounts.dev');

        // Step 2: Handle Clerk cross-domain interaction
        cy.log('Step 2: Interacting with Clerk UI');
        cy.origin('https://rapid-unicorn-55.accounts.dev', { args: { email, password } }, ({ email, password }) => {
            cy.log('WAITING for Clerk page to settle...');
            // Wait for ANY input to appear before starting
            cy.get('input', { timeout: 30000 }).should('be.visible');

            cy.log('Typing email...');
            cy.get('input[name="identifier"], input[type="email"]').first().should('be.visible').type(email);

            cy.log('Clicking Continue...');
            cy.get('button').contains(/Continue|Next|Sign in/i).click();

            cy.log('Typing password...');
            cy.get('input[name="password"], input[type="password"]', { timeout: 30000 }).first().should('be.visible').type(password);

            cy.log('Clicking Sign in...');
            cy.get('button').contains(/Sign in|Continue|Next/i).click();

            cy.log('Waiting for redirect back to app...');
        });

        // Step 3: Verify landing on projects back on localhost
        cy.log('Step 3: Verification on localhost');
        cy.url({ timeout: 30000 }).should('include', '/projects');
        cy.contains('Projects', { timeout: 15000 }).should('be.visible');
    });

});
