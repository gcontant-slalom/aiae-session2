const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

function getTodayIsoDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function formatDueDateLabel(dueDate) {
    if (!dueDate) {
        return 'No due date';
    }

    return DATE_FORMATTER.format(new Date(`${dueDate}T00:00:00.000Z`));
}

export function isTaskOverdue(task) {
    if (!task.dueDate || task.completed) {
        return false;
    }

    return task.dueDate < getTodayIsoDate();
}

export function getEmptyStateCopy(status, search) {
    if (search) {
        return {
            title: 'No tasks match this search',
            description: 'Try a broader keyword or clear the search field to bring your full board back.',
        };
    }

    if (status === 'active') {
        return {
            title: 'No active tasks right now',
            description: 'You have room to capture something new, or switch to All to review completed work.',
        };
    }

    if (status === 'completed') {
        return {
            title: 'No completed tasks to review',
            description: 'Finish a task or switch filters to see what still needs attention.',
        };
    }

    return {
        title: 'Your task board is clear',
        description: 'Add a task with a title, optional notes, and a due date to get started.',
    };
}