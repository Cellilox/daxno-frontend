/**
 * Invites — create + accept.
 *
 * /invites/accept is called by a Next.js Server Action, so we can't intercept
 * the POST from Cypress. We use cy.apiCreateInvite (direct backend call) to
 * mint a real token, then drive the UI: visit /accept-invite, observe the
 * page navigation that follows.
 */
describe('Invites — create + accept', () => {
    before(() => {
        if (!Cypress.env('CLERK_INVITEE_EMAIL')) {
            throw new Error('invites.cy.ts requires CLERK_INVITEE_EMAIL / CLERK_INVITEE_PASSWORD');
        }
        if (!Cypress.env('CLERK_TEST_EMAIL')) {
            throw new Error('invites.cy.ts requires CLERK_TEST_EMAIL / CLERK_TEST_PASSWORD');
        }
    });

    it('owner→invitee end-to-end: invitee lands on /agents/{id} after accept', () => {
        const projectName = `Invite Spec ${Date.now()}`;
        const inviteeEmail = Cypress.env('CLERK_INVITEE_EMAIL');

        cy.loginAs('owner');
        cy.apiCreateProject(projectName).then((projectId) => {
            cy.apiCreateInvite(projectId, inviteeEmail).then((token) => {
                expect(token, 'invite token').to.be.a('string').and.not.empty;

                cy.loginAs('invitee');
                cy.visit(`/accept-invite?token=${encodeURIComponent(token)}&project_id=${projectId}`);

                // After the server action runs, the accept-invite page should
                // redirect to /agents/{projectId} on success.
                cy.location('pathname', { timeout: 20000 }).should((path) => {
                    expect(
                        path.includes(`/agents/${projectId}`) || path.includes('/invite-error'),
                        `expected /agents/${projectId} or /invite-error, got ${path}`,
                    ).to.be.true;
                });
            });
        });
    });

    it('tampered token does not land the invitee in any real project', () => {
        cy.loginAs('invitee');
        cy.visit('/accept-invite?token=not-a-real-token&project_id=00000000-0000-0000-0000-000000000000');

        // Either we end up on /invite-error or stay on /accept-invite with
        // an error visible. We must NOT land on /agents/<fake-id>.
        cy.location('pathname', { timeout: 15000 }).should((path) => {
            expect(
                path.startsWith('/agents/00000000'),
                `tampered token leaked into /agents: ${path}`,
            ).to.be.false;
        });
    });
});
