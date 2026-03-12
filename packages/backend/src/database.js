const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DEFAULT_DATABASE_PATH = path.join(__dirname, '..', 'data', 'tasks.sqlite');
const DATABASE_PATH = process.env.TASKS_DB_PATH || (process.env.NODE_ENV === 'test' ? ':memory:' : DEFAULT_DATABASE_PATH);

const INITIAL_TASKS = [
    {
        title: 'Review sprint notes',
        description: 'Capture action items before tomorrow morning standup.',
        dueDate: '2026-03-15',
        completed: false,
    },
    {
        title: 'Prep quarterly budget',
        description: 'Finalize the spreadsheet for the finance review.',
        dueDate: '2026-03-19',
        completed: false,
    },
    {
        title: 'Book dentist appointment',
        description: 'Call the clinic before Friday afternoon.',
        dueDate: null,
        completed: false,
    },
    {
        title: 'Plan weekend errands',
        description: 'Groceries, pharmacy, and dry cleaning.',
        dueDate: '2026-03-20',
        completed: true,
    },
];

function ensureDatabaseDirectory(databasePath) {
    if (databasePath === ':memory:') {
        return;
    }

    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

function hasTasksTable(database) {
    const result = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tasks'").get();
    return Boolean(result);
}

function seedTasks(database) {
    const insertTask = database.prepare(`
    INSERT INTO tasks (title, description, due_date, completed)
    VALUES (@title, @description, @dueDate, @completed)
  `);

    const insertAllTasks = database.transaction((tasks) => {
        tasks.forEach((task) => {
            insertTask.run({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                completed: task.completed ? 1 : 0,
            });
        });
    });

    insertAllTasks(INITIAL_TASKS);
}

function initializeDatabase(database, databasePath) {
    const tasksTableExists = hasTasksTable(database);

    database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      due_date TEXT,
      completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

    if (databasePath === ':memory:' || !tasksTableExists) {
        seedTasks(database);
    }
}

function createDatabaseConnection(databasePath) {
    ensureDatabaseDirectory(databasePath);

    const database = new Database(databasePath);
    database.pragma('foreign_keys = ON');

    initializeDatabase(database, databasePath);

    return database;
}

const db = createDatabaseConnection(DATABASE_PATH);

function resetDatabase() {
    const reset = db.transaction(() => {
        db.exec('DELETE FROM tasks');
        db.exec("DELETE FROM sqlite_sequence WHERE name = 'tasks'");
        seedTasks(db);
    });

    reset();
}

module.exports = {
    db,
    resetDatabase,
};