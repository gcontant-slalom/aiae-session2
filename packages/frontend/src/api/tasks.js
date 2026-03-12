function buildTaskQuery(filters) {
    const searchParams = new URLSearchParams();

    if (filters.status && filters.status !== 'all') {
        searchParams.set('status', filters.status);
    }

    if (filters.search) {
        searchParams.set('search', filters.search);
    }

    const queryString = searchParams.toString();

    return queryString ? `?${queryString}` : '';
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.error || 'The request could not be completed');
    }

    return data;
}

export function listTasks(filters) {
    return requestJson(`/api/tasks${buildTaskQuery(filters)}`);
}

export function createTask(task) {
    return requestJson('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
    });
}

export function updateTask(taskId, updates) {
    return requestJson(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });
}

export function deleteTask(taskId) {
    return requestJson(`/api/tasks/${taskId}`, {
        method: 'DELETE',
    });
}

export function clearCompletedTasks() {
    return requestJson('/api/tasks/completed', {
        method: 'DELETE',
    });
}