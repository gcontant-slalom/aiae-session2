const VALID_STATUSES = new Set(['all', 'active', 'completed']);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function hasOwnProperty(object, propertyName) {
    return Object.prototype.hasOwnProperty.call(object, propertyName);
}

function parseTaskId(rawTaskId) {
    const taskId = Number.parseInt(rawTaskId, 10);

    if (Number.isNaN(taskId) || taskId < 1) {
        return null;
    }

    return taskId;
}

function parseTaskFilters(query) {
    const status = typeof query.status === 'string' ? query.status.trim().toLowerCase() : 'all';
    const search = typeof query.search === 'string' ? query.search.trim() : '';

    if (!VALID_STATUSES.has(status)) {
        return { error: 'Status must be one of all, active, or completed' };
    }

    return {
        filters: {
            status,
            search,
        },
    };
}

function validateDueDate(rawDueDate) {
    if (rawDueDate === undefined) {
        return { provided: false, value: null };
    }

    if (rawDueDate === null) {
        return { provided: true, value: null };
    }

    if (typeof rawDueDate !== 'string') {
        return { error: 'Task due date must be a valid YYYY-MM-DD date' };
    }

    const trimmedDueDate = rawDueDate.trim();

    if (!trimmedDueDate) {
        return { provided: true, value: null };
    }

    if (!ISO_DATE_PATTERN.test(trimmedDueDate)) {
        return { error: 'Task due date must be a valid YYYY-MM-DD date' };
    }

    const parsedDate = new Date(`${trimmedDueDate}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== trimmedDueDate) {
        return { error: 'Task due date must be a valid YYYY-MM-DD date' };
    }

    return { provided: true, value: trimmedDueDate };
}

function getDueDateValue(payload) {
    if (hasOwnProperty(payload, 'dueDate')) {
        return payload.dueDate;
    }

    if (hasOwnProperty(payload, 'due_date')) {
        return payload.due_date;
    }

    return undefined;
}

function validateCreateTask(payload) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';

    if (!title) {
        return { error: 'Task title is required' };
    }

    if (hasOwnProperty(payload, 'description') && typeof payload.description !== 'string') {
        return { error: 'Task description must be a string' };
    }

    const dueDateValidation = validateDueDate(getDueDateValue(payload));

    if (dueDateValidation.error) {
        return { error: dueDateValidation.error };
    }

    return {
        task: {
            title,
            description: hasOwnProperty(payload, 'description') ? payload.description.trim() : '',
            dueDate: dueDateValidation.value,
            completed: false,
        },
    };
}

function validateTaskUpdate(payload) {
    const updates = {};

    if (hasOwnProperty(payload, 'title')) {
        if (typeof payload.title !== 'string' || payload.title.trim() === '') {
            return { error: 'Task title is required' };
        }

        updates.title = payload.title.trim();
    }

    if (hasOwnProperty(payload, 'description')) {
        if (typeof payload.description !== 'string') {
            return { error: 'Task description must be a string' };
        }

        updates.description = payload.description.trim();
    }

    if (hasOwnProperty(payload, 'dueDate') || hasOwnProperty(payload, 'due_date')) {
        const dueDateValidation = validateDueDate(getDueDateValue(payload));

        if (dueDateValidation.error) {
            return { error: dueDateValidation.error };
        }

        updates.dueDate = dueDateValidation.value;
    }

    if (hasOwnProperty(payload, 'completed')) {
        if (typeof payload.completed !== 'boolean') {
            return { error: 'Task completed must be a boolean' };
        }

        updates.completed = payload.completed;
    }

    if (Object.keys(updates).length === 0) {
        return { error: 'At least one task field must be provided for update' };
    }

    return { updates };
}

module.exports = {
    parseTaskFilters,
    parseTaskId,
    validateCreateTask,
    validateTaskUpdate,
};