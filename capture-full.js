const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const projects = [
  { id: 'selo-brasil', url: 'http://selobrasil.com.br/' },
  { id: 'mirele-fabro', url: 'https://mirelefabro.com.br/' },
  { id: 'slouver-games', url: 'https://slouvergames.com.br/' },
  { id: 'acj-advogados', url: 'https://acjadvogados.com/' },
  { id: 'neves-padua', url: 'https://nevespaduaadvocacia.com.br/' },
  { id: 'riosmed', url: 'https://riosmed.com.br/' },
  { id: 'felipe-bezerril', url: 'https://felipebezerril.adv.br/' },
];

async function cleanPage(page) {
  await page.evaluate(() => {
    // Inject global CSS override to suppress overlays, cookie bars, and popups
    const style = document.createElement('style');
    style.id = 'cleaner-override-style';
    style.innerHTML = `
      .elementor-invisible, [data-settings], .aos-init, [data-aos] {
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }
      .cookie-law-info-bar, #cookie-law-info-bar, #catapult-cookie-bar,
      .cc-window, .cli-modal-backdrop, .e-con-popup, .pum-overlay,
      #onesignal-slidedown-dialog, [class*="cookie-consent"],
      [class*="cookiebanner"], [id*="cookie-notice"], [class*="lgpd"],
      [class*="modal-backdrop"], .modal-backdrop, [class*="popup"] {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    const removeQuery = (q) => {
      document.querySelectorAll(q).forEach(el => {
        const tag = el.tagName.toLowerCase();
        if (tag !== 'main' && tag !== 'header' && tag !== 'footer' && tag !== 'section' && tag !== 'body') {
          el.remove();
        }
      });
    };

    removeQuery('#cookie-law-info-bar');
    removeQuery('#catapult-cookie-bar');
    removeQuery('.cli-modal-backdrop');
    removeQuery('.e-con-popup');
    removeQuery('.pum-overlay');
    removeQuery('[class*="cookie-notice"]');
    removeQuery('[class*="cookie-bar"]');
    removeQuery('[class*="cookiebanner"]');
    removeQuery('[class*="lgpd"]');
  });
}

async function captureAll() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const projectsDir = path.join(__dirname, 'public', 'projects');

  for (const proj of projects) {
    console.log(`Processing ${proj.id} (${proj.url})...`);
    const page = await context.newPage();
    try {
      await page.goto(proj.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      
      await cleanPage(page);
      await page.waitForTimeout(1000);

      // Auto-scroll down smoothly to trigger lazy load images & scroll animations
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 400;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 80);
        });
      });

      await cleanPage(page);
      await page.waitForTimeout(1500);

      await page.evaluate(() => window.scrollTo(0, 0));
      await cleanPage(page);
      await page.waitForTimeout(600);

      const pngBuffer = await page.screenshot({ fullPage: true });

      // Convert to WebP format using Sharp with Max Height Cap (6000px) and width (1200px) for super light file size
      const webpPath = path.join(projectsDir, `${proj.id}.webp`);
      
      const imagePipeline = sharp(pngBuffer);
      const metadata = await imagePipeline.metadata();

      let pipeline = sharp(pngBuffer);
      if (metadata.height && metadata.height > 6000) {
        pipeline = pipeline.extract({ left: 0, top: 0, width: metadata.width, height: 6000 });
      }

      await pipeline
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpPath);

      const stats = fs.statSync(webpPath);
      console.log(`✓ Saved ${proj.id}.webp (${(stats.size / 1024).toFixed(1)} KB)`);

    } catch (err) {
      console.error(`Error processing ${proj.id}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('All WebP screenshots captured successfully!');
}

captureAll();
