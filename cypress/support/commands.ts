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
        // This handles cases where the button click doesn't immediately trigger navigation
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
        cy.location('hostname', { timeout: 20000 }).should('eq', 'localhost');
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
            cy.location('pathname', { timeout: 15000 }).should('eq', '/projects');
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
    cy.clearDatabase();

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
});


Cypress.Commands.add('deleteAllProjects', () => {
    cy.log('🗑️ Resetting backend database and deleting all projects...');

    // 1. Reset backend DB to clear usage limits and business data
    // This runs the maintenance script inside the backend container
    cy.exec('docker exec daxno-backend python3 src/scripts/maintenance/truncate_all_tables.py --force', { failOnNonZeroExit: false })
        .then((result: any) => {
            if (result.code === 0) {
                cy.log('✅ Backend database truncated successfully');
            } else {
                cy.log('⚠️ Backend truncation failed or timed out: ' + result.stderr);
            }
        });

    // 2. Clear IndexedDB and local state
    cy.clearDatabase();

    const apiUrl = 'http://localhost:8000';

    // 3. Try API first (fast)
    cy.request({
        url: `${apiUrl}/projects/`,
        failOnStatusCode: false,
        timeout: 5000
    }).then((response) => {
        if (response.status === 200 && Array.isArray(response.body)) {
            response.body.forEach((project: any) => {
                cy.request({
                    method: 'DELETE',
                    url: `${apiUrl}/projects/${project.id}`,
                    failOnStatusCode: false
                });
            });
        }
    });

    // 2. Just visit and verify we are clean, or delete if visible
    cy.visit('/projects');
    cy.get('body').then(($body) => {
        const cards = $body.find('[data-testid^="project-card-"]');
        if (cards.length > 0) {
            cy.log(`⚠️ Cleaning up ${cards.length} cards via UI...`);
            cy.wrap(cards).each(() => {
                cy.get('[data-testid^="project-card-"]').first().within(() => {
                    cy.get('button[title="Delete project"]').click({ force: true });
                });
                cy.get('[data-testid="alert-dialog-confirm"]').click();
                cy.wait(300);
            });
        }
    });
});

Cypress.Commands.add('clearDatabase', () => {
    cy.window().then(async (win) => {
        // Clear LocalStorage / SessionStorage
        win.localStorage.clear();
        win.sessionStorage.clear();

        // Clear IndexedDB for both Project and Clerk
        const dbs = await win.indexedDB.databases();
        dbs.forEach((db) => {
            if (db.name) {
                win.indexedDB.deleteDatabase(db.name);
            }
        });
    });
});

// Legacy command required by some old tests
Cypress.Commands.add('clearIndexedDB', () => {
    cy.clearDatabase();
});

Cypress.Commands.add('inspectIndexedDB', (storeName) => {
    cy.log(`Inspecting IndexedDB store: ${storeName}`);
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
