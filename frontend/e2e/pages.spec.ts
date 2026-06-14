import { test, expect } from '@playwright/test';

test.describe('Páginas principales', () => {
  test('catálogo muestra ciclos formativos', async ({ page }) => {
    await page.goto('/catalogo');
    await expect(page.locator('main').getByText(/ciclo|formativo|grado/i).first()).toBeVisible();
  });

  test('calendario carga correctamente', async ({ page }) => {
    await page.goto('/calendario');
    await expect(page.locator('main').getByText(/calendario|académico/i).first()).toBeVisible();
  });

  test('alumnado carga correctamente', async ({ page }) => {
    await page.goto('/alumnado');
    await expect(page.locator('main').getByText(/alumnado|estudiante/i).first()).toBeVisible();
  });

  test('matrices carga correctamente', async ({ page }) => {
    await page.goto('/matrices');
    await expect(page.locator('main').getByText(/matriz|RA|CE/i).first()).toBeVisible();
  });

  test('seguimiento carga correctamente', async ({ page }) => {
    await page.goto('/seguimiento');
    await expect(page.locator('main').getByText(/seguimiento|diario/i).first()).toBeVisible();
  });
});
