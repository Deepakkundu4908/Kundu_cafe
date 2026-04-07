const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('../models/Item');

dotenv.config({ path: path.join(__dirname, '../.env') });

const items = require('../data/items.json');
const imagesDir = path.join(__dirname, '../public/images');
const fallbackImage = '/images/kundu-cafe-logo.svg';

const itemImageSources = {
  1: 'https://loremflickr.com/800/600/espresso,coffee',
  2: 'https://loremflickr.com/800/600/cappuccino,coffee',
  3: 'https://loremflickr.com/800/600/croissant,pastry',
  4: 'https://loremflickr.com/800/600/latte,coffee',
  5: 'https://loremflickr.com/800/600/pain-au-chocolat,pastry',
  6: 'https://loremflickr.com/800/600/paneer,sandwich',
  7: 'https://loremflickr.com/800/600/masala,dosa',
  8: 'https://loremflickr.com/800/600/iced,latte',
  9: 'https://loremflickr.com/800/600/chicken,burger',
  10: 'https://loremflickr.com/800/600/veg,biryani',
  11: 'https://loremflickr.com/800/600/mutton,biryani',
  12: 'https://loremflickr.com/800/600/samosa,indian-food',
  13: 'https://loremflickr.com/800/600/pakora,indian-food',
  14: 'https://loremflickr.com/800/600/chicken,tikka',
  15: 'https://loremflickr.com/800/600/french-fries',
  16: 'https://loremflickr.com/800/600/iced-tea,drink',
  17: 'https://loremflickr.com/800/600/cold-coffee,drink',
  18: 'https://loremflickr.com/800/600/lassi,drink',
  19: 'https://loremflickr.com/800/600/fish-curry,rice',
  20: 'https://loremflickr.com/800/600/veg,sandwich'
};

const ensureImagesDir = () => {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
};

const resolveRedirectUrl = (currentUrl, nextLocation) => new URL(nextLocation, currentUrl).toString();

const downloadFile = (url, destination, redirectCount = 0) =>
  new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const request = client.get(
      url,
      {
        headers: {
          'User-Agent': 'KunduCafeImageDownloader/1.0'
        }
      },
      (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          if (redirectCount > 5) {
            reject(new Error(`Too many redirects for ${url}`));
            return;
          }
          const nextUrl = resolveRedirectUrl(url, response.headers.location);
          downloadFile(nextUrl, destination, redirectCount + 1).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`Download failed for ${url} with status ${response.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(destination);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(resolve);
        });

        fileStream.on('error', (error) => {
          fs.unlink(destination, () => reject(error));
        });
      }
    );

    request.on('error', (error) => {
      reject(error);
    });

    request.setTimeout(15000, () => {
      request.destroy(new Error(`Timed out while downloading ${url}`));
    });
  });

const syncMongoImagePaths = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('MONGODB_URI not found. Skipping MongoDB image sync.');
    return;
  }

  await mongoose.connect(mongoUri);

  for (const item of items) {
    await Item.updateOne(
      { id: item.id },
      { $set: { image: item.image || fallbackImage } }
    );
  }

  await mongoose.disconnect();
  console.log('MongoDB image paths synced.');
};

const main = async () => {
  ensureImagesDir();

  const results = [];

  for (const item of items) {
    const imagePath = item.image || fallbackImage;
    const targetFilename = path.basename(imagePath);
    const destination = path.join(imagesDir, targetFilename);
    const sourceUrl = itemImageSources[item.id];

    if (!sourceUrl || imagePath === fallbackImage) {
      results.push({ name: item.name, status: 'skipped', detail: 'No download source configured' });
      continue;
    }

    try {
      await downloadFile(sourceUrl, destination);
      results.push({ name: item.name, status: 'downloaded', detail: targetFilename });
    } catch (error) {
      results.push({ name: item.name, status: 'failed', detail: error.message });
    }
  }

  results.forEach((result) => {
    console.log(`${result.status.toUpperCase()}: ${result.name} -> ${result.detail}`);
  });

  const downloadedCount = results.filter((result) => result.status === 'downloaded').length;
  const failedCount = results.filter((result) => result.status === 'failed').length;

  console.log(`Downloaded ${downloadedCount} item images.`);
  if (failedCount > 0) {
    console.log(`${failedCount} downloads failed.`);
  }

  await syncMongoImagePaths();
};

main().catch((error) => {
  console.error('Image download sync failed:', error);
  process.exit(1);
});
