describe('Phase 1: Authentication & Page Protection', () => {
    describe('1. Protected Routes (Unauthenticated)', () => {
        const protectedRoutes = ['/agents', '/admin', '/billing'];

        protectedRoutes.forEach((route) => {
            it(`should redirect from ${route} to the in-app sign-in page`, () => {
                cy.clearAllCookies();
                cy.visit(route, { failOnStatusCode: false });

                cy.location('pathname', { timeout: 20000 }).should('eq', '/sign-in');
                cy.location('search').should('include', `redirect_url=`);
                cy.location('search').should('include', encodeURIComponent(route));
            });
        });
    });

    describe('2. Visual Login Flow', () => {
        it('should visibly perform the full login interaction', () => {
            cy.login();
            cy.visit('/agents');
            cy.location('pathname').should('eq', '/agents');
            cy.contains('Agents', { timeout: 15000 }).should('be.visible');
        });
    });

    describe('3. Authenticated Access', () => {
        beforeEach(() => {
            cy.login();
        });

        it('should allow access to /agents and show agent list', () => {
            cy.visit('/agents');
            cy.location('pathname').should('eq', '/agents');
            cy.contains('Agents', { timeout: 15000 }).should('be.visible');
            cy.get('[data-testid="add-project-button"]', { timeout: 15000 }).should('exist');
        });

        it('should allow access to other protected areas (Admin/Billing)', () => {
            cy.visit('/billing');
            cy.location('pathname').should('eq', '/billing');
            cy.contains(/Billing|Subscription|Configuration/i).should('be.visible');
        });
    });

    describe('4. Logout Flow', () => {
        it('should redirect to sign-in after manual logout', () => {
            cy.login();
            cy.visit('/agents');

            cy.get('.cl-avatarImage, .cl-userButtonAvatarBox', { timeout: 15000 })
                .first()
                .should('be.visible')
                .click();
            cy.contains('Sign out', { timeout: 10000 }).should('be.visible').click();

            cy.url({ timeout: 20000 }).should((url: string) => {
                const ok =
                    url.includes('/sign-in') ||
                    url === Cypress.config().baseUrl + '/' ||
                    url.endsWith('localhost:3001/');
                expect(ok, `post-logout url ${url}`).to.be.true;
            });
        });
    });
});
