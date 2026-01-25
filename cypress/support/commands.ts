// Custom command to handle Clerk Authentication using UI (Email/Password)
Cypress.Commands.add('login', () => {
    const email = Cypress.env('CLERK_TEST_EMAIL');
    const password = Cypress.env('CLERK_TEST_PASSWORD');

    cy.log(`🔐 Authenticating as ${email}...`);


    // We removed cy.session as per user request to ensure visual typing reliability
    // Start from home page and use the UI
    cy.visit('/');

    // Find and click THE "Sign in" button in the header
    cy.contains('button, a', /Sign in/i, { timeout: 15000 }).should('be.visible').click({ force: true });

    // Plan B: If the click doesn't trigger navigation quickly, visiting /projects forces the redirect
    cy.url().then((url) => {
        if (url === Cypress.config().baseUrl || url === Cypress.config().baseUrl + '/') {
            cy.log('Plan B: Button click did not redirect immediately, visiting /projects to force auth');
            cy.visit('/projects', { failOnStatusCode: false });
        }
    });

    // WAIT for the URL to change to Clerk domain before entering cy.origin
    cy.url({ timeout: 30000 }).should('include', 'accounts.dev');

    // Handle Clerk's cross-origin redirection
    cy.origin('https://rapid-unicorn-55.accounts.dev', { args: { email, password } }, ({ email, password }) => {
        cy.log('WAITING for Clerk page to settle...');
        cy.get('input', { timeout: 30000 }).should('be.visible');

        cy.log('Typing email...');
        cy.get('input[name="identifier"], input[type="email"]', { timeout: 30000 }).first().should('be.visible').type(email);
        cy.get('button').contains(/Continue|Next|Sign in/i).click();

        cy.log('Typing password...');
        cy.get('input[name="password"], input[type="password"]', { timeout: 30000 }).first().should('be.visible').type(password);
        cy.get('button').contains(/Sign in|Continue|Next/i).click();

        cy.log('Waiting for redirect back to app...');
    });

    // Now back on localhost origin
    cy.url({ timeout: 40000 }).should('include', '/projects');

    cy.visit('/projects');

});

// Custom command to clear IndexedDB
Cypress.Commands.add('clearIndexedDB', () => {
    cy.log('🗑️ Clearing IndexedDB...');
    cy.window().then((win) => {
        return new Promise((resolve, reject) => {
            const req = win.indexedDB.deleteDatabase('DaxnoOfflineDB');
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
            req.onblocked = () => {
                cy.log('Blocked clearing IndexedDB - probably open elsewhere');
                resolve(false);
            };
        });
    });
});

// Custom command to inspect IndexedDB content
Cypress.Commands.add('inspectIndexedDB', (storeName) => {
    cy.log(`Hacking into IndexedDB store: ${storeName}`);
    return cy.window().then((win) => {
        return new Promise((resolve, reject) => {
            const req = win.indexedDB.open('DaxnoOfflineDB');
            req.onsuccess = (e) => {
                const db = (e.target as any).result;
                try {
                    const tx = db.transaction(storeName, 'readonly');
                    const store = tx.objectStore(storeName);
                    const getAllReq = store.getAll();
                    getAllReq.onsuccess = () => resolve(getAllReq.result);
                    getAllReq.onerror = () => reject(getAllReq.error);
                } catch (err) {
                    resolve([]); // Store might not exist yet
                }
            };
            req.onerror = () => reject(req.error);
        });
    });
});

