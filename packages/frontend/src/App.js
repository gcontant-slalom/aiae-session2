import React, { useDeferredValue, useEffect, useState } from 'react';
import AddTaskRoundedIcon from '@mui/icons-material/AddTaskRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import {
  clearCompletedTasks,
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from './api/tasks';
import ConfirmDialog from './components/ConfirmDialog';
import TaskCard from './components/TaskCard';
import TaskFormFields from './components/TaskFormFields';
import './App.css';
import { getEmptyStateCopy } from './utils/tasks';

const EMPTY_TASK_FORM = {
  title: '',
  description: '',
  dueDate: '',
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function createEmptyTaskForm() {
  return { ...EMPTY_TASK_FORM };
}

function isValidIsoDate(dateValue) {
  if (!dateValue) {
    return true;
  }

  if (!ISO_DATE_PATTERN.test(dateValue)) {
    return false;
  }

  const parsedDate = new Date(`${dateValue}T00:00:00.000Z`);

  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === dateValue;
}

function validateTaskForm(values) {
  const nextErrors = {};

  if (!values.title.trim()) {
    nextErrors.title = 'Task title is required';
  }

  if (values.dueDate && !isValidIsoDate(values.dueDate)) {
    nextErrors.dueDate = 'Use a valid YYYY-MM-DD date';
  }

  return nextErrors;
}

function normalizeTaskPayload(values) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    dueDate: values.dueDate || null,
  };
}

function getTaskFormValues(task) {
  return {
    title: task.title,
    description: task.description || '',
    dueDate: task.dueDate || '',
  };
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [createValues, setCreateValues] = useState(createEmptyTaskForm());
  const [createErrors, setCreateErrors] = useState({});
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editValues, setEditValues] = useState(createEmptyTaskForm());
  const [editErrors, setEditErrors] = useState({});
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  });

  const deferredSearchText = useDeferredValue(searchText);

  useEffect(() => {
    let isCurrentRequest = true;

    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const result = await listTasks({
          status: statusFilter,
          search: deferredSearchText,
        });

        if (isCurrentRequest) {
          setTasks(result);
          setError(null);
        }
      } catch (err) {
        if (isCurrentRequest) {
          setError(`Failed to fetch tasks: ${err.message}`);
        }
        console.error('Error fetching tasks:', err);
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isCurrentRequest = false;
    };
  }, [deferredSearchText, refreshKey, statusFilter]);

  const visibleCompletedCount = tasks.filter((task) => task.completed).length;
  const visibleActiveCount = tasks.length - visibleCompletedCount;
  const emptyState = getEmptyStateCopy(statusFilter, deferredSearchText);

  function showSnackbar(message, severity = 'success') {
    setSnackbarState({
      open: true,
      severity,
      message,
    });
  }

  function refreshTasks() {
    setRefreshKey((currentValue) => currentValue + 1);
  }

  function handleCreateFieldChange(field, value) {
    setCreateValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setCreateErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  function handleEditFieldChange(field, value) {
    setEditValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setEditErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validateTaskForm(createValues);

    if (Object.keys(nextErrors).length > 0) {
      setCreateErrors(nextErrors);
      return;
    }

    try {
      setIsCreatingTask(true);
      await createTask(normalizeTaskPayload(createValues));
      setCreateValues(createEmptyTaskForm());
      setCreateErrors({});
      showSnackbar('Task added to your board.');
      refreshTasks();
    } catch (err) {
      showSnackbar(`Error adding task: ${err.message}`, 'error');
      console.error('Error adding task:', err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  async function handleToggleComplete(task) {
    try {
      setBusyTaskId(task.id);
      await updateTask(task.id, { completed: !task.completed });
      showSnackbar(task.completed ? 'Task moved back to active.' : 'Task marked as complete.');
      refreshTasks();
    } catch (err) {
      showSnackbar(`Error updating task: ${err.message}`, 'error');
      console.error('Error updating task:', err);
    } finally {
      setBusyTaskId(null);
    }
  }

  function handleOpenEditDialog(task) {
    setEditingTask(task);
    setEditValues(getTaskFormValues(task));
    setEditErrors({});
  }

  function handleCloseEditDialog() {
    if (isSavingTask) {
      return;
    }

    setEditingTask(null);
    setEditValues(createEmptyTaskForm());
    setEditErrors({});
  }

  async function handleSaveTaskEdits() {
    if (!editingTask) {
      return;
    }

    const nextErrors = validateTaskForm(editValues);

    if (Object.keys(nextErrors).length > 0) {
      setEditErrors(nextErrors);
      return;
    }

    try {
      setIsSavingTask(true);
      await updateTask(editingTask.id, normalizeTaskPayload(editValues));
      handleCloseEditDialog();
      showSnackbar('Task details updated.');
      refreshTasks();
    } catch (err) {
      showSnackbar(`Error updating task: ${err.message}`, 'error');
      console.error('Error updating task:', err);
    } finally {
      setIsSavingTask(false);
    }
  }

  function handleDelete(task) {
    setConfirmState({
      mode: 'delete',
      task,
    });
  }

  function handleClearCompleted() {
    setConfirmState({
      mode: 'clear-completed',
    });
  }

  async function handleConfirmAction() {
    if (!confirmState) {
      return;
    }

    try {
      setIsConfirmingAction(true);

      if (confirmState.mode === 'delete') {
        setBusyTaskId(confirmState.task.id);
        await deleteTask(confirmState.task.id);
        showSnackbar('Task removed from your board.');
      }

      if (confirmState.mode === 'clear-completed') {
        const result = await clearCompletedTasks();

        if (result.deletedCount > 0) {
          showSnackbar('Completed tasks cleared.');
        } else {
          showSnackbar('No completed tasks were waiting to be cleared.', 'info');
        }
      }

      setConfirmState(null);
      refreshTasks();
    } catch (err) {
      const actionLabel = confirmState.mode === 'delete' ? 'deleting' : 'clearing completed tasks';
      showSnackbar(`Error ${actionLabel}: ${err.message}`, 'error');
      console.error('Error confirming task action:', err);
    } finally {
      setBusyTaskId(null);
      setIsConfirmingAction(false);
    }
  }

  function getConfirmDialogCopy() {
    if (!confirmState) {
      return {
        title: '',
        description: '',
        confirmLabel: '',
        confirmColor: 'primary',
      };
    }

    if (confirmState.mode === 'delete') {
      return {
        title: 'Delete this task?',
        description: `"${confirmState.task.title}" will be removed from your board. This action cannot be undone.`,
        confirmLabel: 'Delete task',
        confirmColor: 'error',
      };
    }

    return {
      title: 'Clear all completed tasks?',
      description: 'This removes every completed task from the board in one step.',
      confirmLabel: 'Clear completed tasks',
      confirmColor: 'secondary',
    };
  }

  const confirmDialogCopy = getConfirmDialogCopy();

  return (
    <Container className="app-shell" maxWidth="lg">
      <Paper className="hero-panel" component="header" sx={{ px: { xs: 3, md: 4.5 }, py: { xs: 3.5, md: 4 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3}>
          <Stack spacing={1.25}>
            <Typography color="secondary.main" variant="overline">
              Pastel planning desk
            </Typography>
            <Typography component="h1" variant="h1">
              Dayboard
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 520 }} variant="body1">
              A calm task board for capturing what matters, shaping the week, and clearing out the noise.
            </Typography>
          </Stack>
          <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} justifyContent="space-between" spacing={1.5}>
            <Chip color="secondary" label="Material UI pastel workspace" />
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Chip label={`${tasks.length} visible`} variant="outlined" />
              <Chip color="primary" label={`${visibleActiveCount} active`} variant="outlined" />
              <Chip color="success" label={`${visibleCompletedCount} completed`} variant="outlined" />
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {isLoading && tasks.length > 0 && <LinearProgress sx={{ mt: 2, borderRadius: 999 }} />}

      {error && (
        <Alert severity="error" sx={{ mt: 2.5 }} variant="filled">
          {error}
        </Alert>
      )}

      <Box className="control-grid" component="main">
        <Card component="section" variant="outlined">
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2.25}>
              <Box>
                <Typography component="h2" gutterBottom variant="h5">
                  Quick capture
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Add a title now, then include notes and a due date if the task needs more shape.
                </Typography>
              </Box>
              <Box component="form" noValidate onSubmit={handleSubmit}>
                <Stack spacing={2.25}>
                  <TaskFormFields
                    autoFocusTitle
                    disabled={isCreatingTask}
                    errors={createErrors}
                    idPrefix="create-task"
                    onChange={handleCreateFieldChange}
                    values={createValues}
                  />
                  <Button
                    disabled={isCreatingTask}
                    startIcon={isCreatingTask ? <CircularProgress color="inherit" size={18} /> : <AddTaskRoundedIcon />}
                    type="submit"
                    variant="contained"
                  >
                    Add task
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card component="section" variant="outlined">
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography component="h2" gutterBottom variant="h5">
                  Focus view
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Narrow the board by status, search across titles and notes, or clear finished work in one step.
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Search tasks"
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search titles or descriptions"
                value={searchText}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack spacing={1.25}>
                <Typography color="text.secondary" variant="caption">
                  Status filter
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  onChange={(event, nextFilter) => {
                    if (nextFilter) {
                      setStatusFilter(nextFilter);
                    }
                  }}
                  value={statusFilter}
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="active">Active</ToggleButton>
                  <ToggleButton value="completed">Completed</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Button
                color="secondary"
                onClick={handleClearCompleted}
                startIcon={<CleaningServicesRoundedIcon />}
                variant="outlined"
              >
                Clear completed
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card className="tasks-panel" component="section" variant="outlined">
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack alignItems={{ xs: 'flex-start', md: 'center' }} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
              <Box>
                <Typography component="h2" gutterBottom variant="h5">
                  Task board
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Your list stays sorted with active work first and the earliest due dates closest to view.
                </Typography>
              </Box>
              <Chip color="primary" label={statusFilter === 'all' ? 'Showing every task' : `Filter: ${statusFilter}`} variant="outlined" />
            </Stack>

            {isLoading && tasks.length === 0 ? (
              <Paper className="empty-state-panel" sx={{ p: 4 }} variant="outlined">
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6">Loading task board...</Typography>
              </Paper>
            ) : null}

            {!isLoading && tasks.length === 0 ? (
              <Paper className="empty-state-panel" sx={{ p: 4 }} variant="outlined">
                <AutoAwesomeRoundedIcon color="secondary" sx={{ fontSize: 38, mb: 1.5 }} />
                <Typography gutterBottom variant="h6">
                  {emptyState.title}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 440 }} variant="body2">
                  {emptyState.description}
                </Typography>
              </Paper>
            ) : null}

            <Stack spacing={2}>
              {tasks.map((task) => (
                <TaskCard
                  isBusy={busyTaskId === task.id}
                  key={task.id}
                  onDelete={handleDelete}
                  onEdit={handleOpenEditDialog}
                  onToggleComplete={handleToggleComplete}
                  task={task}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Dialog fullWidth maxWidth="sm" onClose={handleCloseEditDialog} open={Boolean(editingTask)}>
        <DialogTitle>Edit task</DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2.5 }}>
            Update the task title, supporting notes, or due date without losing your current filters.
          </DialogContentText>
          <TaskFormFields
            disabled={isSavingTask}
            errors={editErrors}
            idPrefix="edit-task"
            onChange={handleEditFieldChange}
            values={editValues}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button disabled={isSavingTask} onClick={handleCloseEditDialog} variant="text">
            Cancel
          </Button>
          <Button disabled={isSavingTask} onClick={handleSaveTaskEdits} variant="contained">
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        confirmColor={confirmDialogCopy.confirmColor}
        confirmLabel={confirmDialogCopy.confirmLabel}
        description={confirmDialogCopy.description}
        isPending={isConfirmingAction}
        onClose={() => setConfirmState(null)}
        onConfirm={handleConfirmAction}
        open={Boolean(confirmState)}
        title={confirmDialogCopy.title}
      />

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3500}
        onClose={() => setSnackbarState((currentState) => ({ ...currentState, open: false }))}
        open={snackbarState.open}
      >
        <Alert severity={snackbarState.severity} variant="filled">
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;