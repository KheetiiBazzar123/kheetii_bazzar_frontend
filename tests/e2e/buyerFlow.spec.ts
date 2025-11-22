// tests/e2e/buyerFlow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Buyer Full Flow', () => {
  test('register, login, browse, add to wishlist, place order, review, view payments', async ({ page }) => {
    // Register a new buyer
    await page.goto('/auth/register');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Buyer');
    await page.fill('input[name="email"]', 'testbuyer@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.selectOption('select[name="role"]', 'buyer');
    await page.click('button:has-text("Register")');
    await expect(page).toHaveURL(/.*dashboard/);

    // Logout if needed and login again
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'testbuyer@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*buyer/);

    // Browse marketplace and add first product to wishlist
    await page.goto('/buyer/marketplace');
    await page.waitForSelector('button:has-text("Add to Wishlist")');
    const firstAddBtn = await page.$('button:has-text("Add to Wishlist")');
    await firstAddBtn?.click();
    // Verify toast or UI change (simple check for wishlist count)
    await expect(page.locator('text=Wishlist (1)')).toBeVisible();

    // Place an order for the first product
    await page.click('button:has-text("View Details")');
    await page.click('button:has-text("Add to Cart")');
    await page.goto('/buyer/cart');
    await page.click('button:has-text("Proceed to Checkout")');
    // Assume payment page loads
    await page.waitForSelector('text=Payment');
    await page.click('button:has-text("Pay Now")');
    await expect(page.locator('text=Order placed successfully')).toBeVisible();

    // Check order history
    await page.goto('/buyer/orders/history');
    await expect(page.locator('text=Order History')).toBeVisible();
    await expect(page.locator('text=Delivered')).toBeVisible();

    // Leave a review for the delivered order
    await page.click('button:has-text("Leave Review")');
    await page.click('button:has-text("5 Stars")');
    await page.fill('textarea[name="comment"]', 'Great product!');
    await page.click('button:has-text("Submit Review")');
    await expect(page.locator('text=Review submitted')).toBeVisible();

    // View payments
    await page.goto('/buyer/payments');
    await expect(page.locator('text=Payments')).toBeVisible();
    await expect(page.locator('text=Paid')).toBeVisible();
  });
});
