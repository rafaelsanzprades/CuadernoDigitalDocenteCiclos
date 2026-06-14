import { test, expect } from '@playwright/test';

test.describe('Navegación principal', () => {
  test('carga la página de inicio', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Gestión Docente|FP|Cuaderno/);
  });

  test('navega al catálogo', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/catalogo"]');
    await expect(page).toHaveURL(/\/catalogo/);
  });

  test('navega al módulo didáctico', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/modulo"]');
    await expect(page).toHaveURL(/\/modulo/);
  });

  test('navega al calendario', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/calendario"]');
    await expect(page).toHaveURL(/\/calendario/);
  });

  test('navega al alumnado', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/alumnado"]');
    await expect(page).toHaveURL(/\/alumnado/);
  });
});
