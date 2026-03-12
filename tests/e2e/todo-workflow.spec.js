const { test } = require('@playwright/test');

const { TaskBoardPage } = require('./page-objects/task-board.page');

test.describe('TODO app workflow', () => {
  test('creates and completes a task from the dashboard', async ({ page }) => {
    const taskBoardPage = new TaskBoardPage(page);
    const uniqueTaskTitle = `E2E happy path ${Date.now()}`;

    await taskBoardPage.goto();
    await taskBoardPage.expectSeedTaskVisible();

    await taskBoardPage.addTask({
      title: uniqueTaskTitle,
      description: 'Verify the primary user flow through the full stack UI.',
      dueDate: '2026-04-06',
    });

    await taskBoardPage.expectToast('Task added to your board.');
    await taskBoardPage.expectTaskVisible(uniqueTaskTitle);

    await taskBoardPage.markTaskComplete(uniqueTaskTitle);
    await taskBoardPage.expectToast('Task marked as complete.');

    await taskBoardPage.showCompletedTasks();
    await taskBoardPage.expectTaskVisible(uniqueTaskTitle);
  });
});