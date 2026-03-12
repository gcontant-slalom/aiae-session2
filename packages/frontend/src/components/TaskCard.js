import React from 'react';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
    Box,
    Card,
    CardActions,
    CardContent,
    Checkbox,
    Chip,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

import { formatDueDateLabel, isTaskOverdue } from '../utils/tasks';

function TaskCard({ isBusy, onDelete, onEdit, onToggleComplete, task }) {
    const isOverdue = isTaskOverdue(task);
    const statusLabel = task.completed ? 'Completed' : isOverdue ? 'Overdue' : 'Active';
    const statusColor = task.completed ? 'success' : isOverdue ? 'warning' : 'primary';
    const dueDateLabel = task.dueDate ? `Due ${formatDueDateLabel(task.dueDate)}` : 'No due date';

    return (
        <Card
            className={task.completed ? 'task-card task-card--complete' : 'task-card'}
            variant="outlined"
            sx={{
                borderColor: isOverdue && !task.completed ? 'warning.light' : 'rgba(123, 167, 181, 0.18)',
            }}
        >
            <CardContent sx={{ pb: 1.5 }}>
                <Stack spacing={2}>
                    <Stack alignItems="flex-start" direction="row" spacing={1.5}>
                        <Checkbox
                            checked={task.completed}
                            color="success"
                            disabled={isBusy}
                            inputProps={{
                                'aria-label': task.completed
                                    ? `Mark ${task.title} as active`
                                    : `Mark ${task.title} as complete`,
                            }}
                            onChange={() => onToggleComplete(task)}
                        />
                        <Box sx={{ flex: 1, minWidth: 0, pt: 0.75 }}>
                            <Typography
                                component="h3"
                                sx={{
                                    fontSize: '1.05rem',
                                    fontWeight: 700,
                                    mb: 0.75,
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                }}
                                variant="h6"
                            >
                                {task.title}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                                {task.description || 'Add a note to keep the details within reach.'}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        <Chip color={statusColor} label={statusLabel} size="small" />
                        <Chip
                            color={isOverdue && !task.completed ? 'warning' : 'default'}
                            label={dueDateLabel}
                            size="small"
                            variant={task.dueDate ? 'filled' : 'outlined'}
                        />
                    </Stack>
                </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', pt: 0, px: 2.25, pb: 2 }}>
                <Typography color="text.secondary" variant="caption">
                    {task.completed ? 'Ready to clear when you are.' : 'Edit details or check it off as you go.'}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                    <IconButton
                        aria-label={`Edit ${task.title}`}
                        disabled={isBusy}
                        onClick={() => onEdit(task)}
                        size="small"
                    >
                        <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        aria-label={`Delete ${task.title}`}
                        color="error"
                        disabled={isBusy}
                        onClick={() => onDelete(task)}
                        size="small"
                    >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </CardActions>
        </Card>
    );
}

export default TaskCard;