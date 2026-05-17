/**
 * Centralized Cypress selectors.
 *
 * Why this file exists: when the UI is restructured (component split,
 * data-testid rename) the test failure should point to one place, not
 * to a dozen test files. Group by domain.
 *
 * Convention: every selector string starts with `[data-testid=...]`.
 * Tests use them as `cy.get(SEL.columns.addButton)`.
 *
 * Adding a new selector? Put it under the domain it belongs to. Don't
 * inline string testids in test files — if you find yourself doing
 * that, add it here first.
 */

export const SEL = {
    auth: {
        signInButton: '[data-testid="signin-button"]',
    },

    layout: {
        statusOnline: '[data-testid="status-online"]',
        statusOffline: '[data-testid="status-offline"]',
        statusConnecting: '[data-testid="status-connecting"]',
        recordsActionError: '[data-testid="records-action-error"]',
    },

    projects: {
        card: '[data-testid^="project-card-"]',
        addButton: '[data-testid="add-project-button"]',
        nameInput: '[data-testid="project-name-input"]',
        createSubmit: '[data-testid="create-project-submit"]',
    },

    records: {
        table: '[data-testid="records-table"]',
        globalProcessingBanner: '[data-testid="global-processing-banner"]',
    },

    columns: {
        addButton: '[data-testid="add-column-button"]',
        nameInput: '[data-testid="column-name-input"]',
        editInput: '[data-testid="column-edit-input"]',
        nameText: '[data-testid="column-name-text"]',
        // Trash icon testid is dynamic — column name interpolated. Use a builder.
        deleteByName: (name: string) => `[data-testid="delete-column-${name}"]`,
    },

    dialog: {
        backdrop: '[data-testid="alert-dialog-backdrop"]',
        confirm: '[data-testid="alert-dialog-confirm"]',
    },
} as const;

/**
 * Default timeout for "wait for the backend round-trip to finish and the
 * UI to reflect it" assertions. Tune in one place instead of sprinkling
 * `{ timeout: 15000 }` across every assertion.
 *
 * Tests should never use cy.wait(<number>) — it's brittle. Use a
 * default-timeout cy.contains / cy.get and let the retry harness do
 * the polling.
 */
export const DEFAULTS = {
    networkRoundTrip: 15_000,
    pageLoad: 25_000,
    socketLive: 30_000,
} as const;
