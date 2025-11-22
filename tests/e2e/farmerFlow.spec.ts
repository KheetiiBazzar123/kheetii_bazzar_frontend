// tests/e2e/farmerFlow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Farmer Full Flow', () => {
  test('register, login, create product, view earnings, manage orders, notifications', async ({ page }) => {
    // Register a new farmer
    await page.goto('/auth/register');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Farmer');
    await page.fill('input[name="email"]', 'testfarmer@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.selectOption('select[name="role"]', 'farmer');
    await page.click('button:has-text("Register")');
    await expect(page).toHaveURL(/.*dashboard/);

    // Login as farmer (if not already logged in)
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'testfarmer@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*farmer/);

    // Create a new product
    await page.goto('/farmer/products/create');
    await page.fill('input[name="name"]', 'Test Product');
    await page.fill('textarea[name="description"]', 'A fresh test product');
    await page.fill('input[name="price"]', '10');
    await page.fill('input[name="quantity"]', '100');
    // Assume file input for image
    const filePath = 'tests/e2e/fixtures/product.jpg';
    await page.setInputFiles('input[name="images"]', filePath);
    await page.click('button:has-text("Create Product")');
    await expect(page.locator('text=Product created successfully')).toBeVisible();

    // View earnings
    await page.goto('/farmer/earnings');
    await expect(page.locator('text=Earnings')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();

    // Manage orders
    await page.goto('/farmer/orders');
    await expect(page.locator('text=Order History')).toBeVisible();
    // Accept first pending order if exists
    const acceptBtn = await page.$('button:has-text("Accept")');
    if (acceptBtn) {
      await acceptBtn.click();
      await expect(page.locator('text=Order status updated')).toBeVisible();
    }

    // View notifications
    await page.goto('/farmer/notifications');
    await expect(page.locator('text=Notifications')).toBeVisible();
    // Mark first unread as read
    const markBtn = await page.$('button:has-text("Mark as read")');
    if (markBtn) {
      await markBtn.click();
    }
  });
});
