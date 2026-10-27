import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const baseURL = process.env.PORTFOLIO_URL || 'http://localhost:3100';
const cases = [
  { path: '/', title: 'Mirele Fabro', image: 'mirele-fabro', width: 1440 },
  { path: '/', title: 'Felipe Torres Black', image: 'felipe-torres-black', width: 390 },
  { path: '/projetos/landing-pages', title: 'Neves Pádua Advocacia', image: 'neves-padua', width: 1440, titleClick: true },
  { path: '/', title: 'Decopisos Revestimentos', image: 'decopisos', width: 1440, fail: true },
];
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const fixture of cases) {
    const context = await browser.newContext({ viewport: { width: fixture.width, height: 1000 } });
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    let failed = fixture.fail;
    try {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route(url => url.pathname === `/projects/${fixture.image}.webp`
        || (url.pathname === '/_next/image' && url.searchParams.get('url')?.startsWith(`/projects/${fixture.image}.webp`)), async route => {
        await gate;
        if (failed) await route.abort();
        else await route.continue();
      });
      await page.goto(new URL(fixture.path, baseURL).href);
      const card = page.getByRole('button', { name: `Abrir detalhes do projeto ${fixture.title}`, exact: true });
      await card.scrollIntoViewIfNeeded();
      await card.locator('img').evaluate(img => img.decode());
      const cachedPreview = await card.locator('img').evaluate(img => img.currentSrc);
      const target = fixture.titleClick ? page.getByRole('button', { name: fixture.title, exact: true }) : card;
      const started = Date.now();
      await target.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ timeout: 1000 });
      const openedIn = Date.now() - started;
      // Hold the full image past the previous 180ms reveal timer.
      await page.waitForTimeout(850);
      const preview = dialog.locator('img[aria-hidden="true"]');
      const full = dialog.getByAltText(`Screenshot completa do site ${fixture.title}`);
      assert.equal(await preview.evaluate(img => img.currentSrc), cachedPreview, 'reuse the exact cached card image');
      assert.equal(await preview.evaluate(img => img.complete && img.naturalWidth > 0), true);
      assert.equal(await full.evaluate(img => getComputedStyle(img).opacity), '0');
      assert.equal(await dialog.locator('[aria-busy]').getAttribute('aria-busy'), 'true');
      assert.equal(await preview.evaluate(img => {
        for (let el = img; el; el = el.parentElement) {
          if (getComputedStyle(el).opacity === '0' || getComputedStyle(el).visibility === 'hidden') return false;
        }
        return true;
      }), true, 'preview must remain visible throughout the full-image delay');
      assert.equal(await dialog.locator('[aria-busy]').evaluate(el => el.parentElement.scrollHeight > el.parentElement.clientHeight), true, 'preview must already be scrollable');
      assert.equal(await full.getAttribute('srcset'), null, 'already optimized WebP must bypass runtime processing');
      release();
      await page.waitForFunction(() => document.querySelector('[role="dialog"] [aria-busy]')?.getAttribute('aria-busy') === 'false');
      if (fixture.fail) {
        assert.equal(await full.evaluate(img => getComputedStyle(img).opacity), '0');
        assert.equal(await preview.evaluate(img => img.complete && img.naturalWidth > 0), true);
        failed = false;
      } else {
        await full.evaluate(img => img.decode());
        await page.waitForTimeout(180);
        assert.equal(await full.evaluate(img => getComputedStyle(img).opacity), '1');
      }
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      await target.click();
      await page.waitForFunction(() => document.querySelector('[role="dialog"] [aria-busy]')?.getAttribute('aria-busy') === 'false');
      await page.getByRole('dialog').getByAltText(`Screenshot completa do site ${fixture.title}`).evaluate(img => img.decode());
      await page.getByRole('button', { name: 'Fechar modal do projeto (ESC)', exact: true }).click();
      await dialog.waitFor({ state: 'detached' });
      assert.deepEqual(errors, []);
      console.log(`PASS ${fixture.title} (${fixture.width}px): opened in ${openedIn}ms, cached scrollable preview, ${fixture.fail ? 'error fallback and recovery' : 'delayed image'}, close/reopen`);
    } finally {
      release();
      await context.close();
    }
  }
} finally {
  await browser.close();
}
