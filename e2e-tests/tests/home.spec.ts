import { expect, test } from '@playwright/test';

test('home page renders the counter at zero', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Count: 0')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Increment' })).toBeVisible();
});
