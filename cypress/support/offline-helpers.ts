// Helpers to simulate offline/online network states in Cypress
// This uses the Chrome DevTools Protocol (CDP) to force the browser into offline mode

Cypress.Commands.add('goOffline', () => {
    cy.log('🔌 Going Offline...');
    cy.wrap(
        Cypress.automation('remote:debugger:protocol', {
            command: 'Network.emulateNetworkConditions',
            params: {
                offline: true,
                latency: 0,
                downloadThroughput: 0,
                uploadThroughput: 0,
            },
        })
    );
    // Explicitly set navigator.onLine mock if possible, although CDP should handle it.
    // Also dispatch events to the window
    cy.window().then((win) => {
        Object.defineProperty(win.navigator, 'onLine', {
            value: false,
            configurable: true,
            writable: true
        });
        win.dispatchEvent(new Event('offline'));
    });
    cy.wait(2000); // Increased wait
});

Cypress.Commands.add('goOnline', () => {
    cy.log('🌐 Going Online...');
    cy.wrap(
        Cypress.automation('remote:debugger:protocol', {
            command: 'Network.emulateNetworkConditions',
            params: {
                offline: false,
                latency: 0,
                downloadThroughput: -1,
                uploadThroughput: -1,
            },
        })
    );
    cy.window().then((win) => {
        Object.defineProperty(win.navigator, 'onLine', { value: true, configurable: true });
        win.dispatchEvent(new Event('online'));
    });
    cy.wait(1000);
});
