import { test, expect } from '@playwright/test';

test.describe('Páginas principales', () => {
  test('catálogo muestra ciclos formativos', async ({ page }) => {
    await page.goto('/catalogo');
    await expect(page.getByText(/ciclo|formativo|grado/i)).toBeVisible();
  });

  test('calendario carga correctamente', async ({ page }) => {
    await page.goto('/calendario');
    await expect(page.getByText(/calendario|académico/i)).toBeVisible();
  });

  test('alumnado carga correctamente', async ({ page }) => {
    await page.goto('/alumnado');
    await expect(page.getByText(/alumnado|estudiante/i)).toBeVisible();
  });

  test('matrices carga correctamente', async ({ page }) => {
    await page.goto('/matrices');
    await expect(page.getByText(/matriz|RA|CE/i)).toBeVisible();
  });

  test('seguimiento carga correctamente', async ({ page }) => {
    await page.goto('/seguimiento');
    await expect(page.getByText(/seguimiento|diario/i)).toBeVisible();
  });
});
