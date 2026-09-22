/**
 * Minimal PNG encoder — zero dependencies, pure Node.js stdlib.
 *
 * Converts raw 8-bit grayscale pixel data to a valid PNG buffer.
 * Typical compression for a 320×480 fingerprint: ~25-40 KB (vs 150 KB raw).
 *
 * Usage:
 *   import { rawToPng } from '@/features/shared/lib/png-encoder';
 *   const pngBuffer = rawToPng(rawBytes, 320, 480);
 */

import { deflateSync } from 'zlib';

/**
 * CRC-32 (IEEE 802.3) for PNG chunk validation.
 */
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Build a PNG chunk: [length:4][type:4][data][crc:4].
 */
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crcVal = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([len, typeB, data, crcBuf]);
}

/**
 * Convert raw 8-bit grayscale pixels to a PNG buffer.
 *
 * @param {Buffer|Uint8Array} raw - raw grayscale bytes (width × height)
 * @param {number} width - image width in pixels
 * @param {number} height - image height in pixels
 * @returns {Buffer} valid PNG file data
 */
export function rawToPng(raw, width, height) {
  // Validate input
  const expected = width * height;
  if (raw.length < expected) {
    throw new Error(`PNG encode: expected ${expected} bytes, got ${raw.length}`);
  }

  // Add filter byte (0 = None) before each row
  const rowLen = width + 1;
  const filtered = Buffer.alloc(rowLen * height);
  for (let y = 0; y < height; y++) {
    filtered[y * rowLen] = 0; // filter: None
    const srcOffset = y * width;
    const dstOffset = y * rowLen + 1;
    for (let x = 0; x < width; x++) {
      filtered[dstOffset + x] = raw[srcOffset + x];
    }
  }

  // Compress with zlib (deflate)
  const compressed = deflateSync(filtered);

  // Build PNG
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR: width(4), height(4), bitDepth(1), colorType(1), compression(1), filter(1), interlace(1)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth = 8
  ihdr[9] = 0;  // color type = grayscale
  ihdr[10] = 0; // compression = deflate
  ihdr[11] = 0; // filter = adaptive
  ihdr[12] = 0; // interlace = none

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}
