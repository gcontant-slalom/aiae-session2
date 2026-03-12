const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const { db, resetDatabase } = require('./database');
const {
  clearCompletedTasks,
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} = require('./taskRepository');
const {
  parseTaskFilters,
  parseTaskId,
  validateCreateTask,
  validateTaskUpdate,
} = require('./taskValidation');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

function sendServerError(res, message, error) {
  console.error(message, error);
  res.status(500).json({ error: message });
}

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/tasks', (req, res) => {
  const { filters, error } = parseTaskFilters(req.query);

  if (error) {
    return res.status(400).json({ error });
  }

  try {
    res.json(listTasks(filters));
  } catch (requestError) {
    sendServerError(res, 'Failed to fetch tasks', requestError);
  }
});

app.post('/api/tasks', (req, res) => {
  const { task, error } = validateCreateTask(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const createdTask = createTask(task);
    res.status(201).json(createdTask);
  } catch (requestError) {
    sendServerError(res, 'Failed to create task', requestError);
  }
});

app.patch('/api/tasks/:id', (req, res) => {
  const taskId = parseTaskId(req.params.id);

  if (!taskId) {
    return res.status(400).json({ error: 'Valid task ID is required' });
  }

  const { updates, error } = validateTaskUpdate(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const existingTask = getTaskById(taskId);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updateTask(taskId, updates));
  } catch (requestError) {
    sendServerError(res, 'Failed to update task', requestError);
  }
});

app.delete('/api/tasks/completed', (req, res) => {
  try {
    const deletedCount = clearCompletedTasks();

    res.json({
      message: 'Completed tasks cleared successfully',
      deletedCount,
    });
  } catch (requestError) {
    sendServerError(res, 'Failed to clear completed tasks', requestError);
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseTaskId(req.params.id);

  if (!taskId) {
    return res.status(400).json({ error: 'Valid task ID is required' });
  }

  try {
    const existingTask = getTaskById(taskId);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    deleteTask(taskId);
    res.json({ message: 'Task deleted successfully', id: taskId });
  } catch (requestError) {
    sendServerError(res, 'Failed to delete task', requestError);
  }
});

module.exports = { app, db, resetDatabase };