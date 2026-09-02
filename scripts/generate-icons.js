import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, getPixel) {
  // Simple PNG encoder
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // Compression method
  ihdrData.writeUInt8(0, 11); // Filter method
  ihdrData.writeUInt8(0, 12); // Interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const idatCompressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', idatCompressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc >>> 0, 8 + length);
  return chunk;
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Brand LedgerFlow icon pixel generator
function drawLedgerIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background gradient: Emerald (#059669 -> #0f172a)
  const gradT = (nx + ny) / 2;
  let bgR = Math.round(5 * (1 - gradT) + 15 * gradT);
  let bgG = Math.round(150 * (1 - gradT) + 23 * gradT);
  let bgB = Math.round(105 * (1 - gradT) + 42 * gradT);
  let bgA = 255;

  // Margin / corner radius
  const cx = nx - 0.5;
  const cy = ny - 0.5;
  const distFromCenter = Math.sqrt(cx * cx + cy * cy);

  if (!isMaskable && distFromCenter > 0.46) {
    // Smooth anti-aliased rounded corners
    const edge = (distFromCenter - 0.46) / 0.04;
    if (edge >= 1) return [0, 0, 0, 0];
    bgA = Math.round(255 * (1 - edge));
  }

  // White Document Sheet
  const docLeft = 0.26;
  const docRight = 0.74;
  const docTop = 0.22;
  const docBottom = 0.78;

  if (nx >= docLeft && nx <= docRight && ny >= docTop && ny <= docBottom) {
    // Sheet interior
    // Top header bar
    if (ny >= 0.30 && ny <= 0.34) {
      if (nx >= 0.32 && nx <= 0.56) return [15, 23, 42, 255]; // Navy header
      if (nx >= 0.60 && nx <= 0.68) return [16, 185, 129, 255]; // Emerald pill
    }

    // Ledger text lines
    if ((ny >= 0.38 && ny <= 0.40 && nx >= 0.32 && nx <= 0.68) ||
        (ny >= 0.43 && ny <= 0.45 && nx >= 0.32 && nx <= 0.60) ||
        (ny >= 0.48 && ny <= 0.50 && nx >= 0.32 && nx <= 0.68)) {
      return [226, 232, 240, 255]; // Slate line
    }

    // Emerald Action Card
    if (nx >= 0.30 && nx <= 0.70 && ny >= 0.55 && ny <= 0.70) {
      // Plus symbol on card
      const plusCx = 0.38;
      const plusCy = 0.625;
      const pd = Math.sqrt((nx - plusCx) ** 2 + (ny - plusCy) ** 2);
      if (pd < 0.035) {
        if (Math.abs(nx - plusCx) < 0.007 && Math.abs(ny - plusCy) < 0.024) return [255, 255, 255, 255];
        if (Math.abs(ny - plusCy) < 0.007 && Math.abs(nx - plusCx) < 0.024) return [255, 255, 255, 255];
        return [255, 255, 255, 80];
      }

      // Card lines
      if (ny >= 0.60 && ny <= 0.62 && nx >= 0.45 && nx <= 0.65) return [255, 255, 255, 255];
      if (ny >= 0.64 && ny <= 0.655 && nx >= 0.45 && nx <= 0.58) return [255, 255, 255, 190];

      return [16, 185, 129, 255]; // Emerald background
    }

    return [255, 255, 255, 255];
  }

  return [bgR, bgG, bgB, bgA];
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192 PNG
const png192 = createPNG(192, 192, (x, y, w, h) => drawLedgerIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// Generate 512x512 PNG
const png512 = createPNG(512, 512, (x, y, w, h) => drawLedgerIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// Generate Maskable 512x512 PNG (with safe zone)
const pngMaskable = createPNG(512, 512, (x, y, w, h) => drawLedgerIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

// Generate Apple Touch Icon 180x180 PNG
const pngApple = createPNG(180, 180, (x, y, w, h) => drawLedgerIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

// Generate Favicon
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);

console.log('Successfully generated all PWA icons (192x192, 512x512, maskable, apple-touch-icon, favicon)!');
