import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'

let browserPromise: Promise<Browser> | null = null

export async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch()
    browserPromise.catch(() => (browserPromise = null))
  }
  const browser = await browserPromise
  if (browser.isConnected()) return browser
  browserPromise = chromium.launch()
  return browserPromise
}

export async function withPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
  const browser = await getBrowser()
  const context = await browser.newContext()
  const page = await context.newPage()
  try {
    return await fn(page)
  } finally {
    await context.close()
  }
}
