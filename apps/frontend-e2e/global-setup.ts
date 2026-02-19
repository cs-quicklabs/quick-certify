import path from 'path';
import * as fs from 'node:fs';
import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './Playwright/pageobjects/LoginPage';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') });

function createTestImage(filePath: string, sizeKB: number = 50): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = Buffer.alloc(25);
  ihdrChunk.writeUInt32BE(13, 0);
  ihdrChunk.write('IHDR', 4);
  ihdrChunk.writeUInt32BE(1, 8);
  ihdrChunk.writeUInt32BE(1, 12);
  ihdrChunk[16] = 8;
  ihdrChunk[17] = 2;
  ihdrChunk[18] = 0;
  ihdrChunk[19] = 0;
  ihdrChunk[20] = 0;
  ihdrChunk.writeUInt32BE(0x12345678, 21);
  const iendChunk = Buffer.from([
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  let imageData = Buffer.concat([pngSignature, ihdrChunk]);
  if (sizeKB > 1) {
    const paddingSize = (sizeKB - 1) * 1024;
    imageData = Buffer.concat([imageData, Buffer.alloc(paddingSize)]);
  }
  imageData = Buffer.concat([imageData, iendChunk]);
  fs.writeFileSync(filePath, imageData);
}

function ensureTestAssets(): void {
  const assetsDir = path.resolve(__dirname, 'Playwright', 'test-assets');
  const logoPath = path.join(assetsDir, 'logo.png');
  const faviconPath = path.join(assetsDir, 'favicon.png');
  const largeImagePath = path.join(assetsDir, 'large-image.png');
  const pdfPath = path.join(assetsDir, 'document.pdf');

  if (!fs.existsSync(logoPath)) createTestImage(logoPath, 50);
  if (!fs.existsSync(faviconPath)) createTestImage(faviconPath, 50);
  if (!fs.existsSync(largeImagePath)) createTestImage(largeImagePath, 2048);
  if (!fs.existsSync(pdfPath)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.writeFileSync(
      pdfPath,
      Buffer.from(
        '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF',
      ),
    );
  }
}

async function globalSetup(_config: FullConfig) {
  ensureTestAssets();

  const authFile = path.resolve(__dirname, 'auth.json');

  const email = process.env.USER_EMAIL ?? '';
  const password = process.env.USER_PASS ?? '';
  const baseURL = process.env.BASE_URL;

  if (!email || !password) {
    throw new Error('USER_EMAIL or USER_PASSWORD is not defined');
  }

  if (!baseURL) {
    throw new Error('BASE_URL is not defined');
  }

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    baseURL,
  });

  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);

  await context.storageState({ path: authFile });
  await browser.close();
}

export default globalSetup;
