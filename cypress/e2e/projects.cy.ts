describe('Phase 2: Project & Column CRUD', () => {
    // We access the globally defined login command in support/commands.ts
    // which now processes the visual login flow
    beforeEach(() => {
        cy.login();
    });

    it('should create, rename, and then delete a project', () => {
        const timestamp = Date.now();
        const testProjectName = `Test Project ${timestamp}`;
        const newProjectName = `Renamed Project ${timestamp}`;

        // --- 1. CREATE ---
        cy.visit('/projects');
        cy.contains('Projects', { timeout: 10000 }).should('be.visible');

        cy.get('[data-testid="add-project-button"]').should('be.visible').click();
        cy.get('[data-testid="project-name-input"]').should('be.visible').type(testProjectName);
        cy.get('[data-testid="create-project-submit"]').should('be.visible').click();

        // Verify creation
        cy.contains(testProjectName, { timeout: 10000 }).should('be.visible');

        // --- 2. UPDATE (Rename) ---
        // Find the project card by text
        cy.contains(testProjectName).parents('[data-testid^="project-card-"]').within(() => {
            // The buttons are visible on hover, so we force click
            cy.get('button[title="Edit project"]').click({ force: true });
        });

        // Edit Modal should be visible
        cy.contains('Edit Project').should('be.visible');

        // Update name AND description
        const newDescription = `Description for ${timestamp}`;
        cy.contains('label', 'Project Name').next('input').clear().type(newProjectName);
        cy.contains('label', 'Project Description').next('textarea').clear().type(newDescription);

        cy.contains('button', 'Save Changes').click();

        // Verify update (Name and Description)
        cy.contains(newProjectName, { timeout: 10000 }).should('be.visible');
        cy.contains(newDescription).should('be.visible');
        cy.contains(testProjectName).should('not.exist');

        // Verify it's updated in IndexedDB locally
        cy.log('Verifying IndexedDB update...');
        cy.window().then(async (win) => {
            // Note: We might need to wait a moment for the async DB op to finish
            cy.wait(1000);

            return new Promise<void>((resolve, reject) => {
                const req = win.indexedDB.open('daxno-offline');
                req.onsuccess = (e) => {
                    const db = (e.target as any).result;
                    const tx = db.transaction('projects', 'readonly');
                    const store = tx.objectStore('projects');

                    const getAllReq = store.getAll();
                    getAllReq.onsuccess = () => {
                        const allProjectsCache = getAllReq.result;
                        // Check if we have the UPDATED project in the cache
                        const hasUpdatedProject = allProjectsCache.some((entry: any) =>
                            entry.data.some((p: any) =>
                                p.name === newProjectName &&
                                p.description === newDescription
                            )
                        );

                        if (!hasUpdatedProject) {
                            reject(new Error('Updated project NOT found in IndexedDB!'));
                        } else {
                            resolve();
                        }
                    };
                    getAllReq.onerror = () => reject(getAllReq.error);
                };
            });
        });

        // --- 3. DELETE ---
        cy.contains(newProjectName).parents('[data-testid^="project-card-"]').within(() => {
            cy.get('button[title="Delete project"]').click({ force: true });
        });

        // Delete Alert should be visible
        cy.contains('Delete Project').should('be.visible');
        cy.contains('This project and all data associated will be deleted').should('be.visible');

        // Confirm delete
        cy.contains('button', 'Delete').click();

        // Verify it's removed from IndexedDB locally
        cy.log('Verifying IndexedDB deletion...');
        cy.window().then(async (win) => {
            const userId = (window as any).Clerk?.user?.id;
            // Note: We might need to wait a moment for the async DB op to finish
            cy.wait(1000);

            return new Promise<void>((resolve, reject) => {
                const req = win.indexedDB.open('daxno-offline');
                req.onsuccess = (e) => {
                    const db = (e.target as any).result;
                    const tx = db.transaction('projects', 'readonly');
                    const store = tx.objectStore('projects');

                    // We need to find the entry for the current user
                    // Since we don't have the user ID easily in Cypress without interception,
                    // let's iterate or assume single user for test environment
                    const getAllReq = store.getAll();
                    getAllReq.onsuccess = () => {
                        const allProjectsCache = getAllReq.result;
                        // Check if any cache entry contains our deleted project
                        const hasDeletedProject = allProjectsCache.some((entry: any) =>
                            entry.data.some((p: any) => p.name === newProjectName)
                        );

                        if (hasDeletedProject) {
                            reject(new Error('Project found in IndexedDB after deletion!'));
                        } else {
                            resolve();
                        }
                    };
                    getAllReq.onerror = () => reject(getAllReq.error);
                };
            });
        });

        // Reload to ensure the list is refreshed from server
        cy.reload();

        // Verify deletion
        cy.contains(newProjectName, { timeout: 10000 }).should('not.exist');
    });
});
