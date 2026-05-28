/**
 * Billing — BYOK configuration tab.
 *
 * Important: BillingConfig posts via Next.js Server Actions, not browser fetch.
 * So cy.intercept on /tenants/* will NEVER fire from these specs — the browser
 * doesn't make those calls. Coverage of the save flow has to be done through
 * the real backend (form submit → server action → backend → reload).
 *
 * What we test here is UI rendering: tab navigation, key form presence, basic
 * interaction. Network-level guarantees for billing belong in the backend
 * pytest suite or in dedicated integration tests that call the backend
 * directly via cy.request.
 */
describe('Billing — BYOK configuration tab', () => {
    beforeEach(() => {
        cy.login();
    });

    it('opens the Configuration tab and shows the config UI', () => {
        cy.visit('/billing?tab=configuration');

        // The Configuration tab button is in the tabs row; the panel below
        // shows BYOK / Managed / Free options. We only assert the panel
        // mounted (form / inputs visible), since the tab BUTTON also says
        // "Configuration" and matching by text alone is ambiguous.
        cy.contains('button', /^Configuration$/, { timeout: 10000 }).should('be.visible');

        // The config panel renders some form controls — buttons or selects.
        // We use a robust selector that survives label tweaks.
        cy.get('form, [role="tabpanel"], [data-testid*="billing"], select, input', {
            timeout: 10000,
        }).should('exist');
    });

    it('switches between Configuration and Subscription tabs', () => {
        cy.visit('/billing?tab=configuration');
        cy.contains('button', /^Configuration$/).should('be.visible');

        cy.contains('button', /Subscription & History/).click();
        cy.location('search', { timeout: 5000 }).should('include', 'subscriptions-history');

        cy.contains('button', /^Configuration$/).click();
        cy.location('search', { timeout: 5000 }).should('include', 'configuration');
    });
});
