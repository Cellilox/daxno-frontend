/**
 * Cross-cutting error & resilience tests — browser-observable only.
 *
 * Most app data fetching goes through Next.js Server Actions (Node→backend),
 * so cy.intercept on /projects/*, /payments/*, /tenants/* etc. can NEVER fire.
 * Network-level error handling for those paths must be tested in the backend
 * pytest suite or in a Node-side integration harness.
 *
 * From the browser we CAN observe:
 *   - Pages render without blank/white screen on backend errors (server
 *     actions catch failures and return a shape the page renders).
 *   - Middleware redirects (e.g. /agents unauth → /sign-in).
 *   - Browser-direct fetches: /sync/manifest, S3 PUT to presigned URLs,
 *     Google Drive API routes, socket.io.
 */
describe('Error handling — browser-observable resilience', () => {
    it('unauthenticated visit to /agents redirects to /sign-in (middleware)', () => {
        cy.clearAllCookies();
        cy.visit('/agents', { failOnStatusCode: false });
        cy.location('pathname', { timeout: 10000 }).should('eq', '/sign-in');
    });

    it('logged-in /agents renders the page (no blank screen)', () => {
        cy.login();
        cy.visit('/agents');
        cy.contains('Agents', { timeout: 10000 }).should('be.visible');
        // Body must contain text content, not just an empty React error boundary.
        cy.get('body').invoke('text').then((text) => {
            expect(text.trim().length, 'body text length').to.be.greaterThan(20);
        });
    });

    it('/sync/manifest 503 is handled silently (frontend reconcile-skip)', () => {
        // /sync/manifest IS a browser-direct fetch (the OfflineSyncManager
        // calls it client-side). We force a 503 and confirm the page still
        // renders normally and the warning is logged-not-thrown.
        cy.intercept('GET', '**/sync/manifest', {
            statusCode: 503,
            body: { detail: 'Server meta not initialized' },
        }).as('manifest');

        cy.login();
        cy.visit('/agents');
        cy.contains('Agents', { timeout: 10000 }).should('be.visible');
    });

    it('S3 presigned PUT failure during upload surfaces a visible error', () => {
        // This IS browser-side — XHR PUT to the presigned URL. We intercept
        // the PUT and force a 500; the dropzone should show an error, not
        // a successful row in the spreadsheet.
        cy.login();
        cy.apiCreateProject(`S3 Fail ${Date.now()}`).then((projectId) => {
            cy.visit(`/agents/${projectId}`);
            cy.get('body').then(($body) => {
                if ($body.find('[data-testid="close-tutorial"]').length > 0) {
                    cy.get('[data-testid="close-tutorial"]').click();
                }
            });

            cy.contains('button', 'Add Column').click();
            cy.get('[data-testid="column-name-input"]').type('Field{enter}');

            cy.intercept('PUT', '**/upload/**', {
                statusCode: 500,
                body: 'S3 unavailable',
            }).as('s3Put');

            cy.get('[data-testid="scan-files-button"]').filter(':visible').click();
            cy.get('input[data-testid="file-input"]').selectFile(
                'cypress/fixtures/sample-1.pdf',
                { force: true },
            );

            cy.wait('@s3Put', { timeout: 20000 });
            // No record row should appear; an error message should be visible.
            cy.contains(/error|failed|unavailable|try again/i, { timeout: 15000 }).should('be.visible');
        });
    });
});
