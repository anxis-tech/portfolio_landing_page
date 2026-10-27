import { chromium } from 'playwright';
import capture from '../capture-full.js';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import http from 'node:http';

const { preparePage, captureFullPage } = capture;
const image = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="green"/></svg>';
const server = http.createServer((request, response) => {
  if (request.url === '/lazy.svg' || request.url === '/photo_(1).svg') {
    setTimeout(() => {
      response.setHeader('content-type', 'image/svg+xml');
      response.end(image);
    }, 1200);
    return;
  }
  response.setHeader('content-type', 'text/html');
  if (request.url === '/frame') {
    response.end('<body style="background:blue"><img src="/lazy.svg">Loaded frame</body>');
    return;
  }
  if (request.url === '/long-frame') {
    response.end('<body style="background:blue">Visible frame<div style="height:5000px"></div><img loading="lazy" src="/lazy.svg"></body>');
    return;
  }
  response.end(`
    <style>body{margin:0}.spacer{height:7400px}.elementor-invisible{visibility:hidden}footer{height:250px}</style>
    <header style="position:fixed;top:0;left:0;width:100%;height:160px;background:red;z-index:999"></header>
    <h1 style='background-image:url("/photo_(1).svg")'>Capture fixture</h1>
    <div class="spacer"></div>
    <section class="elementor-invisible">Delayed section<img loading="lazy" src="/lazy.svg"></section>
    <iframe loading="lazy" src="/long-frame" width="400" height="900"></iframe>
    <iframe src="/frame" style="visibility:hidden;width:400px;height:200px"></iframe>
    <div style="position:fixed;right:0;bottom:0"><iframe src="/frame" width="100" height="100"></iframe></div>
    <footer>END OF PAGE</footer>
    <script>
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setTimeout(() => {
          document.querySelector('section').classList.remove('elementor-invisible');
          document.querySelector('footer').textContent = 'FOOTER FULLY LOADED';
        }, 900);
      }).observe(document.querySelector('section'));
    </script>
  `);
});

let browser;
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'domcontentloaded' });
  await preparePage(page);

  assert.equal(await page.locator('img').first().evaluate(img => img.complete && img.naturalWidth > 0), true);
  assert.equal(await page.locator('footer').textContent(), 'FOOTER FULLY LOADED');
  assert.equal(await page.locator('section').isVisible(), true);
  const frameRect = await page.locator('iframe').first().boundingBox();
  const buffer = await captureFullPage(page);
  const metadata = await sharp(buffer).metadata();
  assert(metadata.height > 7400, 'capture must include the complete long page');

  const framePixel = await sharp(buffer)
    .extract({ left: 350, top: Math.round(frameRect.y) + 20, width: 1, height: 1 })
    .removeAlpha().raw().toBuffer();
  assert.deepEqual([...framePixel], [0, 0, 255], 'fixed header must not be stamped onto the iframe');

  const column = await sharp(buffer)
    .extract({ left: 1430, top: 1000, width: 1, height: metadata.height - 1000 })
    .removeAlpha().raw().toBuffer();
  let duplicatedBluePixels = 0;
  for (let offset = 0; offset < column.length; offset += 3) {
    if (column[offset] < 30 && column[offset + 1] < 30 && column[offset + 2] > 200) duplicatedBluePixels++;
  }
  assert.equal(duplicatedBluePixels, 0, 'floating iframe must not be duplicated down the page');
  assert.equal(await page.evaluate(() => scrollY), 0);
  assert.equal(await page.locator('header').isVisible(), true, 'fixed elements must be restored');
  console.log('PASS: delayed assets, background URLs, complete footer, visible/hidden/floating iframes, fixed header, restored page');
} finally {
  await browser?.close();
  server.close();
}
