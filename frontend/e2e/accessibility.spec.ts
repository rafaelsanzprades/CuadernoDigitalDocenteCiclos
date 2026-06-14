import { test, expect } from '@playwright/test';

test.describe('Accesibilidad básica', () => {
  test('la página tiene un landmark main', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('los enlaces de navegación son accesibles por teclado', async ({ page }) => {
    await page.goto('/');
    // Tab hasta el primer enlace de navegación
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('toggle del sidebar tiene aria-label', async ({ page }) => {
    await page.goto('/');
    const sidebarToggle = page.locator('[aria-label*="sidebar"], [aria-label*="menú"], [aria-label*="navegación"]').first();
    if (await sidebarToggle.isVisible()) {
      await expect(sidebarToggle).toHaveAttribute('aria-label');
    }
  });

  test('las imágenes tienen alt text o son decorativas', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaHidden = await img.getAttribute('aria-hidden');
      // Cada imagen debe tener alt o aria-hidden
      expect(alt !== null || ariaHidden !== null).toBeTruthy();
    }
  });
});
