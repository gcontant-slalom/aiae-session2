const { expect } = require('@playwright/test');

class TaskBoardPage {
    constructor(page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(this.page.getByRole('heading', { name: 'Dayboard' })).toBeVisible({ timeout: 15000 });
        await expect(this.page.getByText('Quick capture')).toBeVisible({ timeout: 15000 });
    }

    async addTask(task) {
        await this.page.locator('#create-task-title').fill(task.title);
        await this.page.locator('#create-task-description').fill(task.description);
        await this.page.locator('#create-task-due-date').fill(task.dueDate);
        await this.page.getByRole('button', { name: 'Add task' }).click();
    }

    async markTaskComplete(title) {
        await this.page.getByRole('checkbox', { name: `Mark ${title} as complete` }).click();
    }

    async showCompletedTasks() {
        await this.page.locator('button[value="completed"]').click();
    }

    async expectSeedTaskVisible() {
        await expect(this.page.getByText('Review sprint notes')).toBeVisible();
    }

    async expectTaskVisible(title) {
        await expect(this.page.locator('.task-card').filter({ hasText: title }).first()).toBeVisible();
    }

    async expectToast(message) {
        await expect(this.page.getByText(message)).toBeVisible();
    }
}

module.exports = {
    TaskBoardPage,
};