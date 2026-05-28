/**
 * Onyx deep-link button on the agent page.
 *
 * getOnyxDeepLink() is a Next.js Server Action, so the browser never hits
 * /onyx-proxy/project-deep-link directly. We can't intercept it from Cypress.
 * We test what we CAN: the button renders, and clicking it doesn't crash
 * (window.open call happens client-side after the server action returns).
 */
describe('Onyx deep-link button', () => {
    let projectId: string;

    before(() => {
        cy.login();
        cy.apiCreateProject(`Onyx Smoke ${Date.now()}`).then((id) => {
            projectId = id;
            // The Onyx button (and all secondary actions) is pointer-events-none
            // and blurred until the agent has >= 1 column. Seed one so the
            // button is actually interactive — this is what a real user does.
            cy.apiCreateField(id, 'Amount');
        });
    });

    beforeEach(() => {
        cy.login();
    });

    it('renders the Deep Insights & Chat button on the agent page', () => {
        cy.visit(`/agents/${projectId}`);
        // Two copies exist in the DOM (mobile menu md:hidden, desktop visible).
        // Keep only VISIBLE buttons, then keep the one whose text contains the
        // label. (.contains() chained on a set scopes INTO the first element, so
        // we use .filter(':contains()') instead.)
        cy.get('button', { timeout: 15000 })
            .filter(':visible')
            .filter(':contains("Deep Insights")')
            .first()
            .should('be.visible');
    });

    it('clicking the button does not crash the page (window.open stubbed)', () => {
        cy.visit(`/agents/${projectId}`);

        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
            cy.stub(win, 'alert').as('windowAlert');
        });

        cy.get('button', { timeout: 15000 })
            .filter(':visible')
            .filter(':contains("Deep Insights")')
            .first()
            .click();

        // The deep-link is async (server action → backend → Onyx). Poll until
        // EITHER window.open (success) OR window.alert (error) fires. A silent
        // no-op would be a real bug.
        const start = Date.now();
        const pollOutcome = (): Cypress.Chainable<void> =>
            cy.window({ log: false }).then((win: any) => {
                const calls = (win.open?.callCount ?? 0) + (win.alert?.callCount ?? 0);
                if (calls > 0) return;
                if (Date.now() - start > 15000) {
                    throw new Error('Neither window.open nor window.alert fired within 15s of click');
                }
                cy.wait(500, { log: false });
                pollOutcome();
            }) as unknown as Cypress.Chainable<void>;
        pollOutcome();
    });
});

describe('Auth logout', () => {
    it('/auth/logout never gets stuck — eventually navigates away', () => {
        cy.login();
        cy.visit('/auth/logout', { failOnStatusCode: false });
        cy.location('pathname', { timeout: 15000 }).should((path) => {
            expect(path === '/auth/logout', `still on /auth/logout: ${path}`).to.be.false;
        });
    });
});
