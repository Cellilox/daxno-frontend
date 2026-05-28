/**
 * Public submissions — share link.
 *
 * The Share button lives in CollapsibleActions and is blurred /
 * pointer-events-none until the agent has >= 1 column, so we seed a column
 * first (what a real user does). The share modal renders an <h1>Share Link</h1>
 * (ShareableLink.tsx) — a stable assertion target.
 *
 * The /submissions/[token] route is public (no auth). We verify a bad token
 * yields no upload form and does NOT bounce anon visitors to /sign-in.
 */
describe('Public submissions — share link', () => {
    it('owner can open the Share modal on the agent page', () => {
        cy.login();
        cy.apiCreateProject(`Share UI ${Date.now()}`).then((projectId) => {
            cy.apiCreateField(projectId, 'Amount'); // un-blur secondary actions
            cy.visit(`/agents/${projectId}`);

            // Filter to visible buttons before matching (mobile copy is hidden).
            cy.get('button', { timeout: 15000 })
                .filter(':visible')
                .contains(/^Share$/i)
                .click();

            // ShareableLink renders this heading inside the modal.
            cy.contains(/Share Link/i, { timeout: 10000 }).should('be.visible');
        });
    });

    it('bad submission token: no upload form, and anon NOT bounced to /sign-in', () => {
        // One visit covers both guarantees (halves the dev-mode cold-compile cost).
        cy.clearAllCookies();
        cy.visit('/submissions/not-a-real-token', { failOnStatusCode: false });

        // Public route must stay on /submissions/* — bouncing anon to /sign-in
        // would defeat the whole point of a public submission link.
        cy.location('pathname', { timeout: 10000 }).should('include', '/submissions/');

        // A bad token must not expose an upload form.
        cy.get('[data-testid="single-dropzone"], [data-testid="bulk-dropzone"]').should('not.exist');
    });
});
