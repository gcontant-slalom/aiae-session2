const request = require('supertest');

const { app, db, resetDatabase } = require('../src/app');

beforeEach(() => {
  resetDatabase();
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

async function createTask(overrides = {}) {
  const taskPayload = {
    title: 'Temporary task',
    description: 'Temporary description',
    dueDate: '2026-03-25',
    ...overrides,
  };

  const response = await request(app)
    .post('/api/tasks')
    .send(taskPayload)
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);

  return response.body;
}

describe('Task API endpoints', () => {
  describe('GET /api/tasks', () => {
    it('should return seeded tasks in default sort order', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.map((task) => task.title)).toEqual([
        'Review sprint notes',
        'Prep quarterly budget',
        'Book dentist appointment',
        'Plan weekend errands',
      ]);
      expect(response.body[0]).toEqual(expect.objectContaining({
        completed: false,
        description: 'Capture action items before tomorrow morning standup.',
        dueDate: '2026-03-15',
      }));
    });

    it('should filter tasks by status', async () => {
      const response = await request(app).get('/api/tasks?status=completed');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual(expect.objectContaining({
        completed: true,
        title: 'Plan weekend errands',
      }));
    });

    it('should search tasks by title or description', async () => {
      const response = await request(app).get('/api/tasks?search=clinic');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Book dentist appointment');
    });

    it('should reject an unsupported status filter', async () => {
      const response = await request(app).get('/api/tasks?status=archived');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Status must be one of all, active, or completed');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with description and due date', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Submit expense report',
          description: 'Upload receipts before the finance deadline.',
          dueDate: '2026-03-28',
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining({
        title: 'Submit expense report',
        description: 'Upload receipts before the finance deadline.',
        dueDate: '2026-03-28',
        completed: false,
      }));
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 for an invalid due date', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Bad task', dueDate: '2026-02-31' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Task due date must be a valid YYYY-MM-DD date');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update title, description, due date, and completion state', async () => {
      const task = await createTask();

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({
          title: 'Updated task title',
          description: 'Updated description',
          dueDate: null,
          completed: true,
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: task.id,
        title: 'Updated task title',
        description: 'Updated description',
        dueDate: null,
        completed: true,
      }));
    });

    it('should return 400 when no updatable fields are provided', async () => {
      const task = await createTask();

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('At least one task field must be provided for update');
    });

    it('should return 404 when the task does not exist', async () => {
      const response = await request(app)
        .patch('/api/tasks/999999')
        .send({ completed: true })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('DELETE /api/tasks/completed', () => {
    it('should clear completed tasks in one request', async () => {
      const response = await request(app).delete('/api/tasks/completed');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Completed tasks cleared successfully',
        deletedCount: 1,
      });

      const tasksResponse = await request(app).get('/api/tasks?status=completed');
      expect(tasksResponse.status).toBe(200);
      expect(tasksResponse.body).toHaveLength(0);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const task = await createTask({ title: 'Task to delete' });

      const deleteResponse = await request(app).delete(`/api/tasks/${task.id}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: task.id });

      const deleteAgain = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body.error).toBe('Task not found');
    });

    it('should return 400 for an invalid id', async () => {
      const response = await request(app).delete('/api/tasks/abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Valid task ID is required');
    });
  });
});