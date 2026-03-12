const request = require('supertest');

const { app, db, resetDatabase } = require('../../src/app');

beforeEach(() => {
    resetDatabase();
});

afterAll(() => {
    if (db) {
        db.close();
    }
});

describe('Task API integration', () => {
    it('supports the primary happy-path task workflow', async () => {
        const uniqueTitle = 'Prepare roadmap review';

        const createResponse = await request(app)
            .post('/api/tasks')
            .send({
                title: uniqueTitle,
                description: 'Share the updated milestones with stakeholders.',
                dueDate: '2026-04-04',
            })
            .set('Accept', 'application/json');

        expect(createResponse.status).toBe(201);
        expect(createResponse.body).toEqual(expect.objectContaining({
            title: uniqueTitle,
            description: 'Share the updated milestones with stakeholders.',
            dueDate: '2026-04-04',
            completed: false,
        }));

        const createdTaskId = createResponse.body.id;

        const searchResponse = await request(app).get('/api/tasks?search=roadmap');

        expect(searchResponse.status).toBe(200);
        expect(searchResponse.body).toHaveLength(1);
        expect(searchResponse.body[0]).toEqual(expect.objectContaining({
            id: createdTaskId,
            title: uniqueTitle,
        }));

        const updateResponse = await request(app)
            .patch(`/api/tasks/${createdTaskId}`)
            .send({
                description: 'Share the updated milestones and action items with stakeholders.',
                completed: true,
            })
            .set('Accept', 'application/json');

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body).toEqual(expect.objectContaining({
            id: createdTaskId,
            title: uniqueTitle,
            description: 'Share the updated milestones and action items with stakeholders.',
            completed: true,
        }));

        const completedResponse = await request(app).get('/api/tasks?status=completed&search=roadmap');

        expect(completedResponse.status).toBe(200);
        expect(completedResponse.body).toHaveLength(1);
        expect(completedResponse.body[0]).toEqual(expect.objectContaining({
            id: createdTaskId,
            completed: true,
        }));

        const deleteResponse = await request(app).delete(`/api/tasks/${createdTaskId}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body).toEqual({
            message: 'Task deleted successfully',
            id: createdTaskId,
        });

        const emptySearchResponse = await request(app).get('/api/tasks?search=roadmap');

        expect(emptySearchResponse.status).toBe(200);
        expect(emptySearchResponse.body).toHaveLength(0);
    });
});