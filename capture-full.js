const { chromium } = require('playwright');
const sharp = require('sharp');
const { createHash } = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs/promises');
const { projectsData } = require('./src/data/portfolio.ts');
const descriptions = require('./scripts/marketplace-descriptions.json');

const output = path.join(__dirname, 'exports', '99freelas');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForAssets(page, viewportOnly = false) {
  await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 20000 });
  await page.waitForFunction(viewportOnly => [...document.images].every(img => {
    const rect = img.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < innerWidth && (!viewportOnly || (rect.bottom > 0 && rect.top < innerHeight)) && getComputedStyle(img).visibility !== 'hidden';
    const hasSource = img.currentSrc || img.getAttribute('src');
    return !visible || !hasSource || (img.complete && img.naturalWidth > 0);
  }), viewportOnly, { timeout: 20000 });
  // Background images are not included in document.images.
  await page.evaluate(async viewportOnly => {
    const urls = new Set();
    for (const el of document.querySelectorAll('*')) {
      const box = el.getBoundingClientRect();
      if (!el.getClientRects().length || (viewportOnly && (box.bottom <= 0 || box.top >= innerHeight || box.right <= 0 || box.left >= innerWidth))) continue;
      for (const match of getComputedStyle(el).backgroundImage.matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/g)) urls.add(match[1] ?? match[2] ?? match[3]);
    }
    await Promise.all([...urls].map(url => new Promise((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(() => reject(new Error('Background image timed out')), 20000);
      img.onload = () => { clearTimeout(timer); resolve(); };
      img.onerror = () => { clearTimeout(timer); reject(new Error('Background image failed')); };
      img.src = url;
    })));
    await Promise.all([...document.images].filter(img => img.complete && img.naturalWidth).map(img => img.decode().catch(() => {})));
  }, viewportOnly);
}

async function preparePage(page) {
  await page.waitForLoadState('load', { timeout: 30000 });
  await page.evaluate(() => { for (const image of document.querySelectorAll('img, iframe')) image.loading = 'eager'; });
  // Analytics and chat connections can keep a page busy indefinitely.
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
  const deadline = Date.now() + 90000;
  let bottomPasses = 0;
  let lastHeight = 0;
  while (bottomPasses < 3) {
    if (Date.now() > deadline) throw new Error('Page did not reach a stable bottom');
    const state = await page.evaluate(() => {
      window.scrollBy(0, Math.round(innerHeight * 0.65));
      return { height: document.documentElement.scrollHeight, bottom: scrollY + innerHeight >= document.documentElement.scrollHeight - 2 };
    });
    bottomPasses = state.bottom && state.height === lastHeight ? bottomPasses + 1 : 0;
    lastHeight = state.height;
    await sleep(state.bottom ? 800 : 450);
  }
  // Reveal only known entrance-animation states after normal scrolling has run.
  await page.addStyleTag({ content: `
    .elementor-invisible, .aos-init:not(.aos-animate), .wow:not(.animated) {
      opacity: 1 !important; visibility: visible !important; transform: none !important;
    }
    #cookie-law-info-bar, #catapult-cookie-bar, #onetrust-banner-sdk,
    .cky-consent-container, .cli-modal-backdrop, .cookieadmin_law_container,
    .cookieadmin_reconsent_wrap, .cmplz-cookiebanner { display: none !important; }
  ` });
  await waitForAssets(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1500);
  await waitForAssets(page);
}

// Chromium may leave offscreen cross-origin video frames black in fullPage mode.
// Capture those same rectangles while visible, then restore the original layout.
async function captureFullPage(page) {
  const base = await page.screenshot({ fullPage: true, animations: 'disabled', timeout: 30000 });
  const { width, height } = await sharp(base).metadata();
  const overlays = [];
  const frames = [];
  for (const iframe of await page.locator('iframe').all()) {
    if (!await iframe.isVisible() || !await iframe.evaluate(el => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))) continue;
    const rect = await iframe.evaluate(el => {
      // Floating widgets already appear in the base screenshot. Never stamp them
      // into the document again after another frame has scrolled the viewport.
      for (let ancestor = el; ancestor; ancestor = ancestor.parentElement) {
        if (['fixed', 'sticky'].includes(getComputedStyle(ancestor).position)) return null;
      }
      const box = el.getBoundingClientRect();
      return { left: box.left + scrollX, top: box.top + scrollY, width: box.width, height: box.height, source: el.getAttribute('src') };
    });
    if (!rect || !rect.source || rect.source === 'about:blank' || rect.width < 20 || rect.height < 20 || rect.left < 0 || rect.left + rect.width > width || rect.top + rect.height > height) continue;
    frames.push({ iframe, rect });
  }
  const floatingElements = await page.evaluateHandle(() => {
    return [...document.querySelectorAll('*')].filter(el => ['fixed', 'sticky'].includes(getComputedStyle(el).position));
  });
  const overlayClass = '__portfolio_capture_hidden_overlay';
  const overlayStyle = await page.addStyleTag({ content: `.${overlayClass}, .${overlayClass} * { visibility: hidden !important; }` });
  await floatingElements.evaluate((elements, name) => elements.forEach(el => el.classList.add(name)), overlayClass);
  try {
    for (const { iframe, rect } of frames) {
      await iframe.scrollIntoViewIfNeeded();
      await sleep(500);
      const frame = await (await iframe.elementHandle()).contentFrame();
      if (frame) {
        await frame.waitForLoadState('load', { timeout: 20000 });
        await waitForAssets(frame, true);
      }
      const input = await iframe.screenshot({ animations: 'disabled', timeout: 20000 });
      overlays.push({ input: await sharp(input).resize(Math.round(rect.width), Math.round(rect.height)).toBuffer(), left: Math.round(rect.left), top: Math.round(rect.top) });
    }
  } finally {
    await floatingElements.evaluate((elements, name) => elements.forEach(el => el.classList.remove(name)), overlayClass);
    await floatingElements.dispose();
    await overlayStyle.evaluate(el => el.remove());
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await sleep(500);
  return overlays.length ? sharp(base).composite(overlays).png().toBuffer() : base;
}

async function captureAll() {
  await fs.mkdir(output, { recursive: true });
  await fs.mkdir(path.join(__dirname, 'public/projects/previews'), { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const report = JSON.parse(await fs.readFile(path.join(output, 'projects.json'), 'utf8').catch(() => '[]'));
  try {
    const filter = process.argv.slice(2);
    for (const project of projectsData.filter(p => !filter.length || filter.includes(p.id))) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
      page.setDefaultTimeout(25000);
      const entry = { id: project.id, title: project.title, description: descriptions[project.id] || project.description, status: 'failed' };
      try {
        const response = await page.goto(project.link, { waitUntil: 'domcontentloaded', timeout: 40000 });
        if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
        await preparePage(page);
        const buffer = await captureFullPage(page);
        const metadata = await sharp(buffer).metadata();
        // WebP has a 16383px edge limit. Scale the entire page; never crop sections.
        const width = Math.min(1200, Math.floor(16300 * metadata.width / metadata.height));
        const fullPath = path.join(__dirname, 'public', project.fullPageImage || project.image);
        const previewPath = path.join(__dirname, 'public/projects/previews', `${project.id}.webp`);
        const full = await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
        const preview = await sharp(buffer).resize({ width: Math.min(600, width), withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
        // A clean first-screen capture for the marketplace, without browser chrome.
        await page.screenshot({ path: path.join(output, `${project.id}.jpg`), type: 'jpeg', quality: 88, animations: 'disabled' });
        await fs.writeFile(`${fullPath}.tmp`, full);
        await fs.writeFile(`${previewPath}.tmp`, preview);
        await fs.rename(`${fullPath}.tmp`, fullPath);
        await fs.rename(`${previewPath}.tmp`, previewPath);
        const dimensionsPath = path.join(__dirname, 'src/data/project-images.json');
        const dimensions = JSON.parse(await fs.readFile(dimensionsPath, 'utf8'));
        const fullMetadata = await sharp(full).metadata();
        dimensions[project.id] = { width: fullMetadata.width, height: fullMetadata.height, version: createHash('sha256').update(full).digest('hex').slice(0, 12) };
        await fs.writeFile(dimensionsPath, JSON.stringify(dimensions, null, 2) + '\n');
        Object.assign(entry, { status: 'ok', sourceHeight: metadata.height, width, bytes: full.length, previewBytes: preview.length, image: `${project.id}.jpg` });
        console.log(`OK ${project.id}: ${metadata.height}px, ${Math.round(full.length / 1024)}KB / preview ${Math.round(preview.length / 1024)}KB`);
      } catch (error) {
        entry.error = error.message;
        entry.unloadedImages = await page.evaluate(() => [...document.images].filter(img => { const rect = img.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < innerWidth && (!img.complete || !img.naturalWidth); }).map(img => img.currentSrc || img.src)).catch(() => []);
        console.error(`FAILED ${project.id}: ${error.message}`);
        process.exitCode = 1;
      } finally {
        const previous = report.findIndex(item => item.id === entry.id);
        if (previous >= 0) report[previous] = entry; else report.push(entry);
        await page.close();
        await fs.writeFile(path.join(output, 'projects.json'), JSON.stringify(report, null, 2));
      }
    }
  } finally { await browser.close(); }
}
if (require.main === module) captureAll().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { preparePage, waitForAssets, captureFullPage };
