/**
 * cy.login() — log in as the default test owner.
 *
 * Uses @clerk/testing's cy.clerkSignIn() under the hood. That command talks
 * to Clerk's Backend API with CLERK_SECRET_KEY and creates a real session
 * (real __session cookie + JWT). This is the officially supported Cypress
 * path because Clerk's bot-detection silently rejects headless UI logins on
 * dev instances — the UI form is unrunnable from CI even with correct creds.
 *
 * Once cy.clerkSignIn() returns, we visit /agents so middleware can validate
 * the session and the page is ready for the test.
 */
Cypress.Commands.add('login', () => {
    const email = Cypress.env('CLERK_TEST_EMAIL');
    const password = Cypress.env('CLERK_TEST_PASSWORD');

    if (!email || !password) {
        throw new Error(
            'cy.login() requires CLERK_TEST_EMAIL and CLERK_TEST_PASSWORD in cypress.env.json',
        );
    }

    cy.session(
        ['owner-default', email],
        () => {
            cy.visit('/');
            cy.clerkSignIn({
                strategy: 'password',
                identifier: email,
                password,
            });
            cy.visit('/agents');
            cy.location('pathname', { timeout: 20000 }).should('eq', '/agents');
            cy.getCookie('__session', { timeout: 20000 }).should('exist');
        },
        {
            cacheAcrossSpecs: true,
            validate() {
                // Fast cookie-check: confirm the cookies the browser handshake
                // needs are present. No page load. Clerk's client handshake
                // needs __client_uat in addition to __session — checking just
                // __session let stale/partial sessions through and bounced the
                // browser to /sign-in. Sessions don't expire within a single
                // run, so cookie-existence is both fast and solid here.
                cy.getCookie('__session').should('exist');
                cy.getCookie('__client_uat').should('exist');
            },
        },
    );
});

// Custom command to select an existing project by name or create one if not found
Cypress.Commands.add('selectOrCreateProject', (projectName: string) => {
    cy.visit('/agents');
    cy.get('h1').contains('Agents', { timeout: 20000 }).should('be.visible');

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
            // Switch from document-type picker to custom name-entry form
            cy.contains('button', 'Custom', { timeout: 5000 }).click();
            cy.get('[data-testid="project-name-input"]').type(projectName);
            cy.get('[data-testid="create-project-submit"]').click();
            // The agent-creation loader plays ~5s before auto-navigating to /agents/{id}
        }
    });

    // Final verification that we reached the details page (allow extra time for the loader)
    cy.location('pathname', { timeout: 25000 }).should('include', '/agents/');

    // Strictly wait for the LIVE indicator as requested
    cy.log('⌛ Waiting for LIVE status...');
    cy.get('[data-testid="status-online"]', { timeout: 30000 })
        .should('be.visible')
        .and('contain', 'Live');
});


Cypress.Commands.add('deleteAllProjects', () => {
    cy.log('🗑️  Resetting projects (API-first, no docker dependency)...');

    // 1. Clear IndexedDB and local state.
    cy.clearDatabase();

    const apiUrl = Cypress.env('API_URL') || 'http://localhost:8000';

    // 2. API path — fast and decoupled from docker. Uses a FRESH Clerk token
    //    (the cached __session cookie expires after 60s → 401).
    getFreshClerkToken().then((token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        cy.request({
            url: `${apiUrl}/projects/`,
            headers,
            failOnStatusCode: false,
            timeout: 10000,
        }).then((response) => {
            if (response.status === 200 && Array.isArray(response.body)) {
                response.body.forEach((project: any) => {
                    cy.request({
                        method: 'DELETE',
                        url: `${apiUrl}/projects/${project.id}`,
                        headers,
                        failOnStatusCode: false,
                    });
                });
            } else {
                cy.log(`ℹ️  Project list endpoint returned ${response.status}; skipping API cleanup`);
            }
        });
    });

    // 3. UI fallback — only runs if the API path missed something
    //    (e.g. an orphaned card visible in the UI). No more cy.wait —
    //    let the not.exist assertion below drive the polling.
    cy.visit('/agents');
    cy.get('body').then(($body) => {
        const cards = $body.find('[data-testid^="project-card-"]');
        if (cards.length > 0) {
            cy.log(`⚠️  Cleaning up ${cards.length} card(s) via UI fallback...`);
            cy.wrap(cards).each(() => {
                cy.get('[data-testid^="project-card-"]').first().within(() => {
                    cy.get('button[title="Delete agent"]').click({ force: true });
                });
                cy.get('[data-testid="alert-dialog-confirm"]').click();
                // Retry-driven: the card just clicked must vanish before
                // we loop to the next one. Replaces cy.wait(300).
                cy.get('[data-testid^="project-card-"]').should('have.length.lessThan', cards.length);
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

type LoginRole = 'owner' | 'invitee' | 'admin';

const ROLE_ENV_KEYS: Record<LoginRole, { email: string; password: string }> = {
    owner: { email: 'CLERK_TEST_EMAIL', password: 'CLERK_TEST_PASSWORD' },
    invitee: { email: 'CLERK_INVITEE_EMAIL', password: 'CLERK_INVITEE_PASSWORD' },
    admin: { email: 'CLERK_ADMIN_EMAIL', password: 'CLERK_ADMIN_PASSWORD' },
};

Cypress.Commands.add('loginAs', (role: LoginRole = 'owner') => {
    const keys = ROLE_ENV_KEYS[role];
    const email = Cypress.env(keys.email);
    const password = Cypress.env(keys.password);

    if (!email || !password) {
        throw new Error(
            `loginAs('${role}') requires ${keys.email} and ${keys.password} in cypress.env.json`,
        );
    }

    cy.session(
        [role, email],
        () => {
            cy.visit('/');
            cy.clerkSignIn({
                strategy: 'password',
                identifier: email,
                password,
            });
            cy.visit('/agents');
            cy.location('pathname', { timeout: 20000 }).should('eq', '/agents');
            cy.getCookie('__session', { timeout: 20000 }).should('exist');
        },
        {
            cacheAcrossSpecs: true,
            validate() {
                cy.visit('/agents');
                cy.location('pathname', { timeout: 15000 }).should('eq', '/agents');
            },
        },
    );
});

function apiBase(): string {
    return Cypress.env('API_URL') || 'http://localhost:8000';
}

/**
 * Mint a FRESH Clerk session JWT for backend API calls.
 *
 * The `__session` cookie value is a short-lived JWT (Clerk default: 60s). Using
 * the cached cookie as a Bearer token fails with "401 Token expired" once a run
 * passes the 60s mark. window.Clerk.session.getToken() always returns a fresh
 * token. Requires a page with Clerk loaded; if the current frame has no Clerk
 * (e.g. about:blank right after cy.session restore), we load the app shell once.
 */
function getFreshClerkToken(): Cypress.Chainable<string> {
    // Wait until Clerk JS has finished loading and has an active session,
    // THEN mint a token. After cy.visit, window.Clerk initializes async, so
    // reading getToken() immediately throws "Cannot read 'getToken'".
    const readWhenReady = (): Cypress.Chainable<string> =>
        cy
            .window({ log: false })
            .should((w: any) => {
                expect(w.Clerk, 'window.Clerk present').to.exist;
                expect(w.Clerk.loaded, 'Clerk loaded').to.eq(true);
                expect(w.Clerk.session, 'active Clerk session').to.exist;
            })
            .then((w: any) => w.Clerk.session.getToken());

    return cy.window({ log: false }).then((win: any) => {
        if (win?.Clerk?.loaded && win?.Clerk?.session) {
            return win.Clerk.session.getToken();
        }
        // No Clerk on the current frame (e.g. about:blank after session
        // restore) — load the app shell, then wait for Clerk to be ready.
        return cy.visit('/agents').then(() => readWhenReady());
    });
}

function withAuthHeader<T>(fn: (headers: Record<string, string>) => Cypress.Chainable<T>): Cypress.Chainable<T> {
    return getFreshClerkToken().then((token) => {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fn(headers);
    });
}

Cypress.Commands.add('apiCreateProject', (name: string) => {
    return withAuthHeader((headers) =>
        cy
            .request({
                method: 'POST',
                url: `${apiBase()}/projects/`,
                headers,
                body: { name },
                failOnStatusCode: true,
                timeout: 15000,
            })
            .then((res) => {
                const id = res.body?.id ?? res.body?.project?.id;
                if (!id) {
                    throw new Error(
                        `apiCreateProject: response missing id. Body: ${JSON.stringify(res.body)}`,
                    );
                }
                return id as string;
            }),
    );
});

Cypress.Commands.add('apiUploadRecord', (projectId: string, fixture: string) => {
    return cy.fixture(fixture, 'base64').then((b64) => {
        return withAuthHeader((headers) => {
            const form = new FormData();
            const binary = Cypress.Blob.base64StringToBlob(b64, 'application/pdf');
            form.append('file', binary, fixture);
            return cy
                .request({
                    method: 'POST',
                    url: `${apiBase()}/records/upload?project_id=${projectId}`,
                    headers,
                    body: form,
                    failOnStatusCode: true,
                    timeout: 30000,
                })
                .then((res) => {
                    const id = res.body?.record_id ?? res.body?.id;
                    if (!id) {
                        throw new Error(
                            `apiUploadRecord: response missing record id. Body: ${JSON.stringify(res.body)}`,
                        );
                    }
                    return id as string;
                });
        });
    });
});

Cypress.Commands.add('apiCreateInvite', (projectId: string, email: string) => {
    return withAuthHeader((headers) =>
        cy
            .request({
                method: 'POST',
                url: `${apiBase()}/invites/create`,
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: { invitee_user_email: email, project_id: projectId },
                failOnStatusCode: true,
                timeout: 15000,
            })
            .then((res) => {
                const token = res.body?.token ?? res.body?.invite?.token;
                if (!token) {
                    throw new Error(
                        `apiCreateInvite: response missing token. Body: ${JSON.stringify(res.body)}`,
                    );
                }
                return token as string;
            }),
    );
});

Cypress.Commands.add('apiCreateField', (projectId: string, name: string) => {
    // Mirrors CreateColumn.tsx, which posts { id: name, name, description }.
    // Backend FieldItemCreateModel treats all fields as optional.
    return withAuthHeader((headers) =>
        cy
            .request({
                method: 'POST',
                url: `${apiBase()}/fields/${projectId}`,
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: { id: name, name, description: '' },
                failOnStatusCode: true,
                timeout: 15000,
            })
            .then((res) => {
                const id = res.body?.id ?? name;
                return id as string;
            }),
    );
});

Cypress.Commands.add('waitForExtractionComplete', (recordId: string, timeout = 60000) => {
    const start = Date.now();
    const interval = 2000;

    function pollOnce(): Cypress.Chainable<'complete' | 'pending'> {
        return withAuthHeader<'complete' | 'pending'>((headers) =>
            cy
                .request({
                    method: 'GET',
                    url: `${apiBase()}/records/${recordId}/status`,
                    headers,
                    failOnStatusCode: false,
                    timeout: 10000,
                })
                .then((res) => {
                    const status = res.body?.status ?? res.body?.__status__;
                    if (status === 'complete') return 'complete' as const;
                    if (status === 'failed') {
                        throw new Error(
                            `waitForExtractionComplete: record ${recordId} failed. Body: ${JSON.stringify(res.body)}`,
                        );
                    }
                    return 'pending' as const;
                }),
        );
    }

    function loop(): Cypress.Chainable<void> {
        return pollOnce().then((result) => {
            if (result === 'complete') return;
            if (Date.now() - start > timeout) {
                throw new Error(`waitForExtractionComplete: timed out after ${timeout}ms`);
            }
            cy.wait(interval);
            loop();
        }) as unknown as Cypress.Chainable<void>;
    }

    return loop();
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
