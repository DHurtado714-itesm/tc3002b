const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
const ranks = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king'];
const allCards = suits.flatMap(suit => ranks.map(rank => `${rank} of ${suit}`));

const IMAGES_PER_CARD = 300;
const BATCH_SIZE = 50;

const formatCardName = (name) => name.toLowerCase().replace(/\s+/g, '_');

const downloadImage = async (url, folder, index) => {
  try {
    const ext = path.extname(new URL(url).pathname).split('?')[0] || '.jpg';
    const filePath = path.join(folder, `${index}${ext}`);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (err) {
    console.warn(`Error con URL: ${url} – ${err.message}`);
  }
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const card of allCards) {
    const formatted = formatCardName(card);
    const folder = path.join(__dirname, 'dataset', formatted);
    await fs.ensureDir(folder);
    console.log(`🔍 Buscando imágenes para: ${card}`);

    const query = encodeURIComponent(`${card} playing card`);
    const url = `https://www.google.com/search?tbm=isch&q=${query}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Scroll down to load more images
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(0, 1000);
      await page.waitForTimeout(1000);
    }

    const imageUrls = await page.$$eval('img', imgs =>
      imgs.map(img => img.src).filter(src => src?.startsWith('http'))
    );

    const uniqueUrls = [...new Set(imageUrls)].slice(0, IMAGES_PER_CARD);
    console.log(`📸 Encontradas ${uniqueUrls.length} imágenes para ${formatted}`);

    for (let i = 0; i < uniqueUrls.length; i += BATCH_SIZE) {
      const batch = uniqueUrls.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((url, idx) => downloadImage(url, folder, i + idx + 1)));
      console.log(`✅ Descargado batch ${i + 1}–${i + batch.length} de ${formatted}`);
    }

    await new Promise(res => setTimeout(res, 3000)); // pausa entre cartas
  }

  await browser.close();
  console.log('🎉 Todas las cartas han sido procesadas.');
})();
