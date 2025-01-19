import {test, expect} from '@playwright/test';
import {credentials} from './credentials.testData';

test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', {waitUntil: 'commit'});
  });
 
test('login', async ({ page }) => {
    for (const {username, password} of credentials) {
        await expect(page).toHaveTitle('Swag Labs');

        await page.getByPlaceholder('Username').fill(username);
        await page.getByPlaceholder('Password').fill(password);
        await page.getByRole("button", { name: "Login" }).click();
        if (await page.getByRole('heading', {name: /sadface/}).isVisible({timeout:500}))
        {
            console.log(`Login failed for ${username}.`)
        }else{
            console.log(`Login successful for ${username}.`)

            await page.waitForURL('https://www.saucedemo.com/inventory.html');

            await expect(page.getByText('Products')).toBeVisible();
    
            await page.getByRole('button', { name: 'Open Menu' }).click(); 
            await page.getByRole('link', {name: 'Logout'}).click();
            await page.waitForURL('https://www.saucedemo.com/');
            await expect(page.getByRole('button', {name:'Login'})).toBeVisible();  
        }
    }
});

test('e2e-scenario', async ({ page }) => {
    // Assertion that webpage is correct
    await expect(page).toHaveTitle('Swag Labs');

    // Type in user credentials then press the 'Login' button
    await page.getByPlaceholder('Username').fill(credentials[0].username);
    await page.getByPlaceholder('Password').fill(credentials[0].password);
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL('https://www.saucedemo.com/inventory.html');

    // Sort product by price (high to low)
    await page.getByTestId('product-sort-container').selectOption("hilo");
    await expect(page.getByTestId('product-sort-container')).toHaveValue('hilo');

    // Fetch item prices
    const prices = await page.$$eval(
        ".inventory_item_price",
        (elements) =>
        elements.map((el) => parseFloat(el.innerHTML.replace(/[^\d.-]/g, ""))) // Only keep the number from the prices
    );

    // Assert that the prices are arranged from Highest to Lowest
    const sortedPrices = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sortedPrices);

    // Add the first two items to cart then assert if it is selected
    await page
        .locator(".inventory_item:nth-of-type(1)")
        .getByRole("button", { name: "Add to cart" })
        .click();
    const itemName_1 = await page
        .locator(".inventory_item:nth-of-type(1) .inventory_item_name")
        .innerHTML();
    expect(
        page
        .locator(".inventory_item:nth-of-type(1)")
        .getByRole("button", { name: "Remove" })
    ).toBeVisible();

    await page
        .locator(".inventory_item:nth-of-type(2)")
        .getByRole("button", { name: "Add to cart" })
        .click();
    const itemName_2 = await page
        .locator(".inventory_item:nth-of-type(2) .inventory_item_name")
        .innerHTML();
    await expect(
        page
        .locator(".inventory_item:nth-of-type(2)")
        .getByRole("button", { name: "Remove" })
    ).toBeVisible();

    // Assert shopping cart badge number
    expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');

    // Open cart
    await page.getByTestId('shopping-cart-link').click();

    // Assertion for cart page transition
    await page.waitForURL('https://www.saucedemo.com/cart.html');
    await expect(page.getByText('Your Cart')).toBeVisible();

    // Assert if all items are added to cart correctly
    await expect(page.getByText(itemName_1)).toBeVisible();
    await expect(page.getByText(itemName_2)).toBeVisible();

    // Proceed To Checkout
    await page.getByTestId('checkout').click();

    // Assertion for checkout page 1 transition
    await page.waitForURL('https://www.saucedemo.com/checkout-step-one.html');
    await expect(page.getByText('Checkout: Your Information')).toBeVisible();

    // Fill Checkout data
    await page.getByTestId('firstName').fill("testFirst");
    await page.getByTestId('lastName').fill("testLast");
    await page.getByTestId('postalCode').fill("1234");
    await page.getByTestId('continue').click();

    // Assertion for checkout page 2 transition
    await page.waitForURL('https://www.saucedemo.com/checkout-step-two.html');
    await expect(page.getByText('Checkout: Overview')).toBeVisible();

    // Extract prices of selected items
    const selectedPrices = await page.$$eval(
        ".inventory_item_price",
        (elements) =>
        elements.map((el) => parseFloat(el.innerHTML.replace(/[^\d.-]/g, '')))
    );

    // Get total price of selected items
    let sum = 0;
    selectedPrices.forEach(x => {
        sum += x;
    });
    const totalPrice = await page.getByTestId('subtotal-label').innerText();
    const targetTotalPrice = parseFloat(totalPrice.replace(/[^\d.-]/g, ''));

    // Assert computed total price from displayed total price
    expect(targetTotalPrice).toBe(sum);

    // Finish Checkout procedure
    await page.getByTestId('finish').click();

    // Assertion for checkout complete page transition
    await page.waitForURL('https://www.saucedemo.com/checkout-complete.html');
    await expect(page.getByText('Checkout: Complete!')).toBeVisible();

    // Go back to products screen
    await page.getByTestId('back-to-products').click();

    // Assertion for products page transition
    await page.waitForURL('https://www.saucedemo.com/inventory.html');
    await expect(page.getByText('Products')).toBeVisible();

    // Logout user
    await page.getByRole("button", { name: "Open Menu" }).click();
    await page.getByTestId('logout-sidebar-link').click();

    // Assertion for products page transition
    await page.waitForURL('https://www.saucedemo.com/');
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

});

