const { db } = require('./database');

function mapTaskRow(taskRow) {
    if (!taskRow) {
        return null;
    }

    return {
        id: taskRow.id,
        title: taskRow.title,
        description: taskRow.description,
        dueDate: taskRow.due_date,
        completed: Boolean(taskRow.completed),
        createdAt: taskRow.created_at,
        updatedAt: taskRow.updated_at,
    };
}

function getTaskById(taskId) {
    const task = db.prepare(`
    SELECT id, title, description, due_date, completed, created_at, updated_at
    FROM tasks
    WHERE id = ?
  `).get(taskId);

    return mapTaskRow(task);
}

function listTasks(filters) {
    const whereConditions = [];
    const statementParameters = {};

    if (filters.status === 'active') {
        whereConditions.push('completed = 0');
    }

    if (filters.status === 'completed') {
        whereConditions.push('completed = 1');
    }

    if (filters.search) {
        whereConditions.push('(LOWER(title) LIKE @search OR LOWER(description) LIKE @search)');
        statementParameters.search = `%${filters.search.toLowerCase()}%`;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const tasks = db.prepare(`
    SELECT id, title, description, due_date, completed, created_at, updated_at
    FROM tasks
    ${whereClause}
    ORDER BY completed ASC, CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC, due_date ASC, created_at DESC, id DESC
  `).all(statementParameters);

    return tasks.map(mapTaskRow);
}

function createTask(task) {
    const result = db.prepare(`
    INSERT INTO tasks (title, description, due_date, completed)
    VALUES (@title, @description, @dueDate, @completed)
  `).run({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        completed: task.completed ? 1 : 0,
    });

    return getTaskById(result.lastInsertRowid);
}

function updateTask(taskId, updates) {
    const assignments = ['updated_at = CURRENT_TIMESTAMP'];
    const statementParameters = { taskId };

    if (Object.prototype.hasOwnProperty.call(updates, 'title')) {
        assignments.push('title = @title');
        statementParameters.title = updates.title;
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'description')) {
        assignments.push('description = @description');
        statementParameters.description = updates.description;
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'dueDate')) {
        assignments.push('due_date = @dueDate');
        statementParameters.dueDate = updates.dueDate;
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'completed')) {
        assignments.push('completed = @completed');
        statementParameters.completed = updates.completed ? 1 : 0;
    }

    db.prepare(`
    UPDATE tasks
    SET ${assignments.join(', ')}
    WHERE id = @taskId
  `).run(statementParameters);

    return getTaskById(taskId);
}

function deleteTask(taskId) {
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
    return result.changes > 0;
}

function clearCompletedTasks() {
    const result = db.prepare('DELETE FROM tasks WHERE completed = 1').run();
    return result.changes;
}

module.exports = {
    clearCompletedTasks,
    createTask,
    deleteTask,
    getTaskById,
    listTasks,
    updateTask,
};