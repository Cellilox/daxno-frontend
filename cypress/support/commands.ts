// Custom command to handle Clerk Authentication
Cypress.Commands.add('login', () => {
    cy.log('Bypassing Clerk Login UI...');

    // Strategy: In a real CI environment, we would use a test user's JWT
    // For now, we'll set the session cookie directly if we have a dev token,
    // or we will use a dedicated "test-mode" bypass if our middleware allows it.

    // NOTE: Clerk recommends using their 'clerk-js' library in tests or 
    // mocking the __clerk_db cookie.

    // For this project, we will use a simpler approach for now: 
    // We will visit the sign-in page once and let the user handle the first login,
    // OR we will use the 'CYPRESS_CLERK_SESSION_TOKEN' if provided.

    const token = Cypress.env('CLERK_SESSION_TOKEN');

    if (token) {
        cy.setCookie('__session', token);
    } else {
        cy.log('No CLERK_SESSION_TOKEN found. Manual login might be required for the first run.');
    }

    cy.visit('/projects');
});
