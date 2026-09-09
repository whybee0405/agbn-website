import { test, expect } from '@playwright/test'

async function visit(page: import('@playwright/test').Page, route: string) {
  await page.goto(route)
  await page.waitForLoadState('networkidle')
}

for (const width of [320, 390, 768, 1440]) {
  test(`key pages reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/', '/pricing', '/join', '/opportunities']) {
      await visit(page, route)
      await expect(page.locator('h1')).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    }
  })
}

test('homepage explains the process without unsupported member results', async ({ page }) => {
  await visit(page, '/')
  await expect(page.locator('main')).not.toContainText('700+')
  await expect(page.locator('main')).not.toContainText('54 countries')
  const journeyLinks = page.locator('.journey-link')
  await expect(journeyLinks).toHaveCount(4)
  await expect(journeyLinks.nth(0)).toHaveAttribute('href', '/join')
  await expect(journeyLinks.nth(2)).toContainText('Commission follows the agreed terms')
  await expect(journeyLinks.nth(2)).toHaveAttribute('href', '/pricing')
})

test('membership tier context is retained while unpublished listings stay private', async ({ page }) => {
  await visit(page, '/join?tier=2')
  await expect(page.locator('#join-tier')).toHaveValue('2')
  await visit(page, '/join?tier=invalid')
  await expect(page.locator('#join-tier')).toHaveValue('')
  await visit(page, '/opportunities')
  await expect(page.locator('main')).toContainText('opportunity board is in development')
  await expect(page.locator('main')).not.toContainText('Healthcare Equipment Supply Contract')
})

test('failed application preserves input and offers recovery without a server write', async ({ page }) => {
  await visit(page, '/join')
  await page.getByRole('button', { name: 'Apply to join', exact: true }).click()
  await expect(page.locator('#join-name')).toBeFocused()
  await page.locator('#join-name').fill('Browser test')
  await page.locator('#join-email').fill('test@example.com')
  await page.locator('#join-phone').fill('+27000000000')
  await page.route('**/*', route => route.request().method() === 'POST' ? route.abort('failed') : route.continue())
  await page.getByRole('button', { name: 'Apply to join', exact: true }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'couldn’t confirm' })).toBeVisible()
  await expect(page.locator('#join-name')).toHaveValue('Browser test')
  await expect(page.getByRole('button', { name: 'Apply to join', exact: true })).toBeEnabled()
})

test('mobile navigation closes when focus leaves and on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await visit(page, '/join')
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await page.locator('#mobile-nav a').last().focus()
  await page.keyboard.press('Tab')
  await expect(page.locator('#mobile-nav')).toHaveCount(0)
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeFocused()
  await page.evaluate(() => window.scrollTo(0, 700))
  await expect(page.getByRole('button', { name: 'Dismiss', exact: true })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Chat with AGBN on WhatsApp', exact: true })).toHaveCount(0)
})

test('unpublished magazine detail routes do not expose seeded articles', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await visit(page, '/magazine/doing-business-in-ghana-what-agbn-members-need-to-know')
  await expect(page.locator('main')).not.toContainText('Doing Business in Ghana')
})

test('unpublished opportunity and event seed records are not promoted', async ({ page }) => {
  await visit(page, '/opportunities')
  await expect(page.locator('main')).toContainText('opportunity board is in development')
  await visit(page, '/events')
  await expect(page.locator('main')).toContainText('Hard Rock Cafe')
  await expect(page.locator('main')).not.toContainText('Africa Elite Roundtable')
})

test('unverified stories and placeholder email are not promoted', async ({ page }) => {
  await visit(page, '/case-studies')
  await expect(page.locator('main')).toContainText('verified outcomes')
  await expect(page.locator('main')).not.toContainText('$40,000')
  await visit(page, '/magazine')
  await expect(page.locator('main')).toContainText('magazine is in development')
  await expect(page.locator('main')).not.toContainText('$40,000')
  await visit(page, '/contact')
  await expect(page.locator('main')).not.toContainText('hello@agbn.example')
})
