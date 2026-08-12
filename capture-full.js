const { chromium } = require('playwright');

const projects = [
  { url: 'http://selobrasil.com.br/', file: 'public/projects/selo-brasil.png' },
  { url: 'https://mirelefabro.com.br/', file: 'public/projects/mirele-fabro.png' },
  { url: 'https://slouvergames.com.br/', file: 'public/projects/slouver-games.png' },
  { url: 'https://acjadvogados.com/', file: 'public/projects/acj-advogados.png' },
  { url: 'https://nevespaduaadvocacia.com.br/', file: 'public/projects/neves-padua.png' },
  { url: 'https://riosmed.com.br/', file: 'public/projects/riosmed.png' },
  { url: 'https://felipebezerril.adv.br/', file: 'public/projects/felipe-bezerril.png' },
];

async function captureAll() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // High DPI / Retina crispness
  });

  for (const proj of projects) {
    console.log(`Processing ${proj.url}...`);
    const page = await context.newPage();
    try {
      await page.goto(proj.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      
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
          }, 100);
        });
      });

      // Wait a moment for all animations/images to settle, then scroll back to top
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      // Take full page screenshot
      await page.screenshot({ path: proj.file, fullPage: true });
      console.log(`✓ Saved ${proj.file}`);
    } catch (err) {
      console.error(`Error processing ${proj.url}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully with full content loaded!');
}

captureAll();
