const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');

function loadApp(dbPath) {
    process.env.TASKS_DB_PATH = dbPath;
    jest.resetModules();

    return require('../../src/app');
}

describe('Task persistence integration', () => {
    it('persists a created task across app reloads when using a file-backed database', async () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiae-session2-'));
        const dbPath = path.join(tempDir, 'tasks.sqlite');
        const uniqueTitle = `Persistence task ${Date.now()}`;
        let firstAppInstance;
        let secondAppInstance;

        try {
            firstAppInstance = loadApp(dbPath);

            const createResponse = await request(firstAppInstance.app)
                .post('/api/tasks')
                .send({
                    title: uniqueTitle,
                    description: 'Verify the task survives application reloads.',
                    dueDate: '2026-04-05',
                })
                .set('Accept', 'application/json');

            expect(createResponse.status).toBe(201);
            expect(fs.existsSync(dbPath)).toBe(true);

            firstAppInstance.db.close();
            firstAppInstance = null;

            secondAppInstance = loadApp(dbPath);

            const persistedTaskResponse = await request(secondAppInstance.app)
                .get(`/api/tasks?search=${encodeURIComponent(uniqueTitle)}`);

            expect(persistedTaskResponse.status).toBe(200);
            expect(persistedTaskResponse.body).toHaveLength(1);
            expect(persistedTaskResponse.body[0]).toEqual(expect.objectContaining({
                title: uniqueTitle,
                description: 'Verify the task survives application reloads.',
                dueDate: '2026-04-05',
                completed: false,
            }));
        } finally {
            if (firstAppInstance?.db?.open) {
                firstAppInstance.db.close();
            }

            if (secondAppInstance?.db?.open) {
                secondAppInstance.db.close();
            }

            delete process.env.TASKS_DB_PATH;
            jest.resetModules();
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });
});