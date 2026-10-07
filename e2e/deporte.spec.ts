import { expect, test } from './apoyo'

test('marcas: encuentra la mejor, mide el progreso y exporta a Excel', async ({ page }) => {
  await page.goto('/marcas')
  await page.getByLabel('Atleta', { exact: true }).fill('Juan Vasquez')

  // Cada marca nueva entra de primera en la lista, por eso siempre se llena la número 1.
  for (const [fecha, marca] of [
    ['2025-11-20', '1,98'],
    ['2026-03-15', '2,04'],
    ['2026-08-22', '2,06'],
  ] as const) {
    await page.getByRole('button', { name: 'Agregar marca' }).click()
    await page.getByLabel('Fecha de la marca 1').fill(fecha)
    await page.getByLabel('Marca 1 en metros').fill(marca)
  }

  const indicadores = page.locator('.ui-indicador')
  await expect(indicadores.filter({ hasText: 'Mejor marca' })).toContainText('2,06 m')
  await expect(indicadores.filter({ hasText: 'Primera a última' })).toContainText('+0,08 m')

  const esperaDescarga = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Excel (CSV)' }).click()
  expect((await esperaDescarga).suggestedFilename()).toBe('marcas-juan-vasquez.csv')
})

test('marcas: una marca mal escrita se avisa en vez de contarse', async ({ page }) => {
  await page.goto('/marcas')
  await page.getByRole('button', { name: 'Agregar marca' }).click()
  await page.getByLabel('Marca 1 en metros').fill('dos')
  await expect(page.getByRole('alert')).toContainText('No se entiende esta marca')
})

test('cargas: la semana siguiente parte de la anterior y se compara con ella', async ({ page }) => {
  await page.goto('/cargas')
  await page.getByLabel('Nombre del ejercicio 1').fill('Sentadilla trasera')
  await page.getByLabel('Series del ejercicio 1').fill('4')
  await page.getByLabel('Reps del ejercicio 1').fill('5')
  await page.getByLabel('Kg del ejercicio 1').fill('100')

  // 4 series × 5 repeticiones × 100 kg = 2.000 kg.
  const indicadores = page.locator('.ui-indicador')
  await expect(indicadores.filter({ hasText: 'Total de Semana 1' })).toContainText('2.000 kg')

  await page.getByRole('button', { name: 'Semana siguiente' }).click()
  await expect(page.getByLabel('Nombre del ejercicio 1')).toHaveValue('Sentadilla trasera')
  await page.getByLabel('Kg del ejercicio 1').fill('125')
  await page.getByLabel('Avisar si la semana sube más de (%)').fill('10')

  // 4 × 5 × 125 = 2.500 kg: sube 25 % y pasa el tope de 10 %.
  await expect(indicadores.filter({ hasText: 'Frente a la semana anterior' })).toContainText(
    '+25 %',
  )
  await expect(page.getByText('Semana 2 sube 25 % frente a Semana 1')).toBeVisible()
})
