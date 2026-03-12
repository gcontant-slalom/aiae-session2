import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';
import { appTheme } from '../theme';

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

const initialTasks = [
  {
    id: 1,
    title: 'Write planning notes',
    description: 'Capture standup talking points before the team sync.',
    dueDate: '2026-03-15',
    completed: false,
    createdAt: '2026-03-10T09:00:00.000Z',
    updatedAt: '2026-03-10T09:00:00.000Z',
  },
  {
    id: 2,
    title: 'Book dentist appointment',
    description: 'Call the clinic before Friday afternoon.',
    dueDate: null,
    completed: false,
    createdAt: '2026-03-11T09:00:00.000Z',
    updatedAt: '2026-03-11T09:00:00.000Z',
  },
  {
    id: 3,
    title: 'Plan weekend errands',
    description: 'Pick up flowers, groceries, and cleaning supplies.',
    dueDate: '2026-03-20',
    completed: true,
    createdAt: '2026-03-09T09:00:00.000Z',
    updatedAt: '2026-03-09T09:00:00.000Z',
  },
];

function cloneTasks(list) {
  return JSON.parse(JSON.stringify(list));
}

let tasks = cloneTasks(initialTasks);

function sortTasks(list) {
  return [...list].sort((firstTask, secondTask) => {
    if (firstTask.completed !== secondTask.completed) {
      return Number(firstTask.completed) - Number(secondTask.completed);
    }

    const firstDueDate = firstTask.dueDate || '9999-12-31';
    const secondDueDate = secondTask.dueDate || '9999-12-31';

    if (firstDueDate !== secondDueDate) {
      return firstDueDate.localeCompare(secondDueDate);
    }

    return secondTask.createdAt.localeCompare(firstTask.createdAt);
  });
}

function getVisibleTasks(url) {
  const status = url.searchParams.get('status') || 'all';
  const search = (url.searchParams.get('search') || '').toLowerCase();

  return sortTasks(tasks).filter((task) => {
    if (status === 'active' && task.completed) {
      return false;
    }

    if (status === 'completed' && !task.completed) {
      return false;
    }

    if (!search) {
      return true;
    }

    return task.title.toLowerCase().includes(search) || task.description.toLowerCase().includes(search);
  });
}

function renderApp() {
  return render(
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

// Mock server to intercept API requests
const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(getVisibleTasks(req.url)));
  }),

  rest.post('/api/tasks', (req, res, ctx) => {
    const { description = '', dueDate = null, title } = req.body;

    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    const nextTask = {
      id: Math.max(...tasks.map((task) => task.id), 0) + 1,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      completed: false,
      createdAt: '2026-03-12T09:00:00.000Z',
      updatedAt: '2026-03-12T09:00:00.000Z',
    };

    tasks.push(nextTask);

    return res(ctx.status(201), ctx.json(nextTask));
  }),

  rest.patch('/api/tasks/:id', (req, res, ctx) => {
    const taskId = Number(req.params.id);
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...req.body,
      updatedAt: '2026-03-12T12:00:00.000Z',
    };

    return res(ctx.status(200), ctx.json(tasks[taskIndex]));
  }),

  rest.delete('/api/tasks/completed', (req, res, ctx) => {
    const completedCount = tasks.filter((task) => task.completed).length;
    tasks = tasks.filter((task) => !task.completed);

    return res(
      ctx.status(200),
      ctx.json({
        message: 'Completed tasks cleared successfully',
        deletedCount: completedCount,
      })
    );
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const taskId = Number(req.params.id);
    tasks = tasks.filter((task) => task.id !== taskId);

    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id: taskId }));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => {
  tasks = cloneTasks(initialTasks);
});
afterEach(() => {
  server.resetHandlers();
  consoleErrorSpy.mockClear();
});
afterAll(() => {
  server.close();
  consoleErrorSpy.mockRestore();
});

describe('App Component', () => {
  test('renders the Material task board and loads tasks', async () => {
    renderApp();

    expect(screen.getByRole('heading', { name: 'Dayboard' })).toBeInTheDocument();
    expect(screen.getByText('Pastel planning desk')).toBeInTheDocument();
    expect(await screen.findByText('Write planning notes')).toBeInTheDocument();
    expect(screen.getByText('Book dentist appointment')).toBeInTheDocument();
  });

  test('adds a new task with notes and a due date', async () => {
    const user = userEvent.setup();

    renderApp();

    expect(await screen.findByText('Write planning notes')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: /task title/i }), {
      target: { value: 'Schedule annual review' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Confirm agenda with HR before the meeting.' },
    });
    fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2026-04-02' } });
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByText('Schedule annual review')).toBeInTheDocument();
    expect(await screen.findByText('Task added to your board.')).toBeInTheDocument();
  });

  test('filters and searches tasks', async () => {
    const user = userEvent.setup();

    renderApp();

    expect(await screen.findByText('Write planning notes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Completed' }));
    expect(await screen.findByText('Plan weekend errands')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Write planning notes')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.type(screen.getByLabelText('Search tasks'), 'clinic');
    await waitFor(() => {
      expect(screen.queryByText('Write planning notes')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Book dentist appointment')).toBeInTheDocument();
  });

  test('edits task details from the dialog', async () => {
    const user = userEvent.setup();

    renderApp();

    expect(await screen.findByText('Book dentist appointment')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit Book dentist appointment' }));

    const dialog = await screen.findByRole('dialog', { name: 'Edit task' });
    const dialogQueries = within(dialog);

    await user.clear(dialogQueries.getByRole('textbox', { name: /task title/i }));
    await user.type(dialogQueries.getByRole('textbox', { name: /task title/i }), 'Book annual physical');
    fireEvent.change(dialogQueries.getByLabelText('Due date'), { target: { value: '2026-04-08' } });
    await user.click(dialogQueries.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Book annual physical')).toBeInTheDocument();
    expect(await screen.findByText('Task details updated.')).toBeInTheDocument();
  });

  test('marks an active task complete and removes it from the active filter', async () => {
    const user = userEvent.setup();

    renderApp();

    expect(await screen.findByText('Write planning notes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(await screen.findByText('Write planning notes')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Mark Write planning notes as complete' }));

    await waitFor(() => {
      expect(screen.queryByText('Write planning notes')).not.toBeInTheDocument();
    });
  });

  test('clears completed tasks after confirmation', async () => {
    const user = userEvent.setup();

    renderApp();

    expect(await screen.findByText('Plan weekend errands')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear completed' }));
    await user.click(await screen.findByRole('button', { name: 'Clear completed tasks' }));

    await waitFor(() => {
      expect(screen.queryByText('Plan weekend errands')).not.toBeInTheDocument();
    });
  });

  test('deletes an existing task after confirmation', async () => {
    const user = userEvent.setup();

    renderApp();

    expect(await screen.findByText('Write planning notes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete Write planning notes' }));
    await user.click(await screen.findByRole('button', { name: 'Delete task' }));

    await waitFor(() => {
      expect(screen.queryByText('Write planning notes')).not.toBeInTheDocument();
    });
  });

  test('handles API error during initial load', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => res(ctx.status(500), ctx.json({ error: 'Failed to fetch tasks' })))
    );

    renderApp();

    expect(await screen.findByText('Failed to fetch tasks: Failed to fetch tasks')).toBeInTheDocument();
  });

  test('shows an empty state when the filter has no results', async () => {
    const user = userEvent.setup();

    renderApp();

    expect(await screen.findByText('Write planning notes')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Search tasks'), 'nonexistent phrase');

    await waitFor(() => {
      expect(screen.getByText('No tasks match this search')).toBeInTheDocument();
    });
  });
});