import React from 'react';
import { Stack, TextField } from '@mui/material';

function TaskFormFields({ autoFocusTitle = false, disabled = false, errors, idPrefix, onChange, values }) {
    return (
        <Stack spacing={2.25}>
            <TextField
                autoFocus={autoFocusTitle}
                disabled={disabled}
                error={Boolean(errors.title)}
                fullWidth
                helperText={errors.title || 'A short verb-first title works best.'}
                id={`${idPrefix}-title`}
                label="Task title"
                onChange={(event) => onChange('title', event.target.value)}
                required
                value={values.title}
            />
            <TextField
                disabled={disabled}
                fullWidth
                helperText="Optional context that helps later."
                id={`${idPrefix}-description`}
                label="Description"
                minRows={3}
                multiline
                onChange={(event) => onChange('description', event.target.value)}
                value={values.description}
            />
            <TextField
                disabled={disabled}
                error={Boolean(errors.dueDate)}
                fullWidth
                helperText={errors.dueDate || 'Optional. Leave blank for unscheduled tasks.'}
                id={`${idPrefix}-due-date`}
                InputLabelProps={{ shrink: true }}
                label="Due date"
                onChange={(event) => onChange('dueDate', event.target.value)}
                type="date"
                value={values.dueDate}
            />
        </Stack>
    );
}

export default TaskFormFields;