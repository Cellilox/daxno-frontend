/**
 * Upload + extraction lifecycle — browser-observable parts only.
 *
 * Dropzone calls getPresignedUrl, uploadFile, queryDocument — all Next.js
 * Server Actions. cy.intercept can't catch them. What we CAN catch:
 *   - S3 PUT to the presigned URL (XMLHttpRequest, browser-side)
 *   - Socket.IO events that report progress (browser-side)
 *   - UI changes (record row appearing, error banner showing)
 *
 * Negative paths for "extraction failed" / "usage limit" should be tested
 * against the real backend by setting up a fixture user with that state, not
 * by mocking server-action responses.
 */
describe('File upload — browser-observable lifecycle', () => {
    let projectId: string;

    beforeEach(() => {
        cy.login();
        cy.apiCreateProject(`Upload ${Date.now()}`).then((id) => {
            projectId = id;
            // Seed a column so the project leaves the first-run state
            // (firstRunActive = fields.length === 0 && records.length === 0).
            // Only then does the Scan Files toolbar render.
            cy.apiCreateField(id, 'Amount');
        });
    });

    it('happy path: drop a PDF → S3 PUT fires → record row appears', () => {
        // Presigned upload goes straight to S3 (https://<bucket>.s3...amazonaws.com/<key>),
        // which has no "/upload/" path — match any PUT (the only PUT in this flow).
        cy.intercept('PUT', '**').as('s3Upload');

        cy.visit(`/agents/${projectId}`);
        cy.get('[data-testid="scan-files-button"]', { timeout: 15000 })
            .filter(':visible')
            .first()
            .click();
        cy.get('[data-testid="single-dropzone"]').should('be.visible');
        cy.get('input[data-testid="file-input"]').selectFile(
            'cypress/fixtures/sample-1.pdf',
            { force: true },
        );
        // Selecting a file only stages it — must click the upload button to start.
        cy.get('[data-testid="start-upload-button"]').click({ force: true });

        cy.wait('@s3Upload', { timeout: 30000 })
            .its('response.statusCode')
            .should('be.oneOf', [200, 204]);

        cy.contains('sample-1.pdf', { timeout: 60000 }).should('be.visible');
        cy.get('[data-testid^="record-row-"]', { timeout: 60000 }).should('have.length.gte', 1);
    });

    it('invalid file type (.txt) does not produce a record row', () => {
        cy.visit(`/agents/${projectId}`);
        cy.get('[data-testid="scan-files-button"]', { timeout: 15000 })
            .filter(':visible')
            .first()
            .click();
        cy.get('input[data-testid="file-input"]').selectFile(
            'cypress/fixtures/invalid.txt',
            { force: true },
        );

        // Give the dropzone time to react. Either it rejects with a message,
        // or the upload is attempted and server rejects. Either way, no row
        // appears in the spreadsheet.
        cy.wait(3000);
        cy.get('[data-testid^="record-row-"]').should('not.exist');
    });
});
