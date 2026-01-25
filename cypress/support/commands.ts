// Custom command to handle Clerk Authentication using UI (Email/Password)
Cypress.Commands.add('login', () => {
    const email = Cypress.env('CLERK_TEST_EMAIL');
    const password = Cypress.env('CLERK_TEST_PASSWORD');

    // Use cy.session to capture and reuse the authentication state
    cy.session([email, password], () => {
        cy.log(`🔐 Starting visual login flow for session...`);

        // Ensure a clean slate for a fresh login
        cy.clearAllCookies();
        cy.clearAllLocalStorage();
        cy.clearAllSessionStorage();

        cy.visit('/');

        // 1. Click Sign In 
        cy.get('body').then(($body) => {
            const testidBtn = $body.find('[data-testid="signin-button"]');
            if (testidBtn.length > 0) {
                cy.wrap(testidBtn).click({ force: true });
            } else {
                cy.contains('a, button', /Sign in/i, { timeout: 15000 }).should('be.visible').click({ force: true });
            }
        });

        // --- PLAN B: Force the redirect if we are still on localhost ---
        // --- PLAN B: Force the redirect if we are still on localhost ---
        cy.location('pathname').then((pathname) => {
            if (pathname === '/' || pathname === '') {
                cy.log('Plan B: Button click stuck on localhost. Forcing redirect via /projects...');
                cy.visit('/projects', { failOnStatusCode: false });
            }
        });

        // 2. Handle Clerk Auth Redirect
        cy.url({ timeout: 30000 }).should('include', 'accounts.dev');

        cy.origin('https://rapid-unicorn-55.accounts.dev', { args: { email, password } }, ({ email, password }) => {
            cy.get('input', { timeout: 30000 }).should('be.visible');

            cy.log('Typing email...');
            cy.get('input[name="identifier"], input[type="email"]').first().should('be.visible').type(email);
            cy.get('button').contains(/Continue|Next|Sign in/i).should('be.visible').click();

            cy.log('Typing password...');
            cy.get('input[name="password"], input[type="password"]', { timeout: 30000 }).first().should('be.visible').type(password);
            cy.get('button').contains(/Sign in|Continue|Next/i).should('be.visible').click();
        });

        // 3. MUST land back on our domain and WAIT for session cookie to settle
        cy.visit('/projects');

        // STRICT CHECK: Ensure we are back on localhost and on the right path
        cy.location('hostname').should('eq', 'localhost');
        cy.location('pathname').should('eq', '/projects');

        // Wait for the Clerk session cookie and UI to be definitive
        cy.getCookie('__session', { timeout: 20000 }).should('exist');
        cy.contains('Projects', { timeout: 20000 }).should('be.visible');
    }, {
        cacheAcrossSpecs: true,
        validate() {
            // THE CHECK: Perform a light server-side check.
            cy.request({
                url: '/projects',
                followRedirect: false,
                failOnStatusCode: false
            }).its('status').should('eq', 200);

            // Also ensure the UI is in place and we haven't been pushed out
            cy.visit('/projects');
            cy.location('hostname').should('eq', 'localhost');
            cy.location('pathname').should('eq', '/projects');
            cy.get('h1').contains('Projects', { timeout: 15000 }).should('be.visible');
            cy.getCookie('__session').should('exist');
        }
    });
});

// Custom command to select an existing project by name or create one if not found
Cypress.Commands.add('selectOrCreateProject', (projectName: string) => {
    cy.visit('/projects');
    cy.get('h1').contains('Projects', { timeout: 20000 }).should('be.visible');

    // Robustly clear IndexedDB to prevent "Internal error opening backing store"
    cy.window().then(async (win) => {
        const dbs = ['DaxnoOfflineDB', 'daxno-db']; // Clear both potential names
        for (const dbName of dbs) {
            try {
                win.indexedDB.deleteDatabase(dbName);
                console.log(`🗑️ Cleared DB: ${dbName}`);
            } catch (e) {
                console.warn(`⚠️ Failed to clear ${dbName}`, e);
            }
        }
    });

    // Wait a bit for IndexedDB/API to populate project list
    cy.log(`⌛ Checking for project: ${projectName}`);
    cy.wait(1000);

    cy.get('body').then(($body) => {
        const projectCard = $body.find('[data-testid^="project-card-"]').filter((i, el) => {
            return el.innerText.toLowerCase().includes(projectName.toLowerCase());
        });

        if (projectCard.length > 0) {
            cy.log(`✅ Reusing project card: ${projectName}`);
            cy.wrap(projectCard).first().scrollIntoView().click({ force: true });
        } else {
            cy.log(`➕ Creating new project: ${projectName}`);
            cy.get('[data-testid="add-project-button"]').click();
            cy.get('[data-testid="project-name-input"]').type(projectName);
            cy.get('[data-testid="create-project-submit"]').click();

            // Should redirect or at least show project in list
            cy.contains('h3', projectName, { timeout: 15000 }).scrollIntoView().click({ force: true });
        }
    });

    // Final verification that we reached the details page
    cy.location('pathname', { timeout: 20000 }).should('include', '/projects/');

    // Strictly wait for the LIVE indicator as requested
    cy.log('⌛ Waiting for LIVE status...');
    cy.get('[data-testid="status-online"]', { timeout: 30000 })
        .should('be.visible')
        .and('contain', 'Live');

    // Robustly clear IndexedDB to prevent "Internal error opening backing store"
    cy.window().then(async (win) => {
        const dbs = ['DaxnoOfflineDB', 'daxno-db']; // Clear both potential names
        for (const dbName of dbs) {
            try {
                const req = win.indexedDB.deleteDatabase(dbName);
                req.onsuccess = () => cy.log(`🗑️ Cleared DB: ${dbName}`);
                req.onerror = () => cy.log(`⚠️ Failed to clear ${dbName}`);
                req.onblocked = () => cy.log(`⚠️ Blocked clearing ${dbName}`);
            } catch (e) {
                cy.log(`⚠️ Exception clearing ${dbName}: ${e}`);
            }
        }
    });

    cy.log('✅ Page is LIVE and connected');
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
