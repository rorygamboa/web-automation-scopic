import {test, expect} from '@playwright/test';
import {credentials} from './credentials.testData';

test('login', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', {waitUntil: 'commit'});
    for (const {username, password} of credentials) {
        await expect(page).toHaveTitle('Swag Labs');

        page.locator('[data-test="username"]').click;
        await page.locator('[data-test="username"]').fill(username);
        page.locator('[data-test="password"]').click;
        await page.locator('[data-test="password"]').fill(password);
        await page.getByRole("button", { name: "Login" }).click();

        if (await page.locator('[data-test="error"]').isVisible({timeout: 5000}))
        {
            console.log(`Login failed for ${username}.`)
        }else{
            console.log(`Login successful for ${username}.`)

            await page.waitForURL('https://www.saucedemo.com/inventory.html');

            await expect(page.locator('[data-test="title"]')).toBeVisible();
    
            await page.getByRole('button', { name: 'Open Menu' }).click();
            await page.locator('[data-test="logout-sidebar-link"]').click();
            await page.waitForURL('https://www.saucedemo.com/');
            await expect(page.locator('[data-test="login-button"]')).toBeVisible();
        }
    }
});

test('e2e-scenario', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', {waitUntil: 'commit'});

    await expect(page).toHaveTitle('Swag Labs');

    page.locator('[data-test="username"]').click;
    await page.locator('[data-test="username"]').fill(credentials[0].username);
    page.locator('[data-test="password"]').click;
    await page.locator('[data-test="password"]').fill(credentials[0].password);
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL('https://www.saucedemo.com/inventory.html');
});

