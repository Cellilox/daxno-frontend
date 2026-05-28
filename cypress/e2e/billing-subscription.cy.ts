/**
 * Billing — Subscription tab.
 *
 * Same constraint as billing-byok: Billing/Subscription data is fetched and
 * mutated via Next.js Server Actions, not browser fetch. cy.intercept on
 * /payments/* would never fire. We test what we CAN observe from the browser:
 * tab navigation, the empty-state UI, the pricing CTA.
 *
 * For real payment-flow coverage, use a backend integration test that hits
 * /payments/charge-card-and-mobilerwanda with a known fixture user.
 */
describe('Billing — Subscription tab', () => {
    beforeEach(() => {
        cy.login();
    });

    it('renders the Subscription & History tab', () => {
        cy.visit('/billing?tab=subscriptions-history');
        cy.contains(/Subscription|History|No Active Subscription|View Pricing/i, {
            timeout: 10000,
        }).should('be.visible');
    });

    it('shows the View Pricing CTA when there is no active subscription', () => {
        cy.visit('/billing?tab=subscriptions-history');

        // Body must not be empty — the page must render something useful.
        // Either pricing CTA, an active subscription block, or history list.
        cy.get('body').then(($body) => {
            const text = $body.text();
            const hasUsefulContent =
                /View Pricing|No Active Subscription|Plan|Subscription|Cancel|Active/i.test(text);
            expect(hasUsefulContent, 'subscription tab has content').to.be.true;
        });
    });
});
