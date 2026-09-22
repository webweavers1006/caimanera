/**
 * Diagnostic: replay the browser rendering pipeline on a real BMP capture
 * and save the intermediate results as PNG so they can be compared.
 *
 * Usage: node scripts/repro-fingerprint-render.mjs <path-to-bmp>
 */
import { readFileSync, writeFileSync } from "fs";
import { cropFinger, processFrame } from "../src/features/fingerprint/lib/frame-processing.js";
import { rawToPng } from "../src/features/shared/lib/png-encoder.js";

const bmpPath = process.argv[2];

// BMP layout from the native writer: 54-byte header + 1024-byte palette,
// 8-bit grayscale, bottom-up rows.
const bmp = readFileSync(bmpPath);
const width = 320;
const height = 480;
const headerSize = 54 + 1024;
let raw = Buffer.from(bmp.subarray(headerSize, headerSize + width * height));
// Flip bottom-up to top-down
const flipped = Buffer.alloc(width * height);
for (let y = 0; y < height; y++) {
  raw.copy(flipped, y * width, (height - 1 - y) * width, (height - y) * width);
}
raw = flipped;

const out = (name, pixels, w, h) => writeFileSync(name, rawToPng(pixels, w, h));

// 1. RAW (what the terminal shows, top-down)
out("render-1-raw.png", raw, width, height);
console.log("1-raw.png", width, "x", height);

// 2. NEW pipeline: cropFinger only, raw pixels (no stretch)
const crop = cropFinger(raw, width, height);
console.log("cropFinger:", crop ? `${crop.width}x${crop.height}` : "none (keeps full frame)");
const fData = crop ? crop.data : raw;
const fWidth = crop ? crop.width : width;
const fHeight = crop ? crop.height : height;
out("render-2-new-pipeline.png", fData, fWidth, fHeight);

// 3. OLD pipeline: cropFinger + contrast stretch (for comparison)
const processed = processFrame(fData, fWidth, fHeight, false);
out("render-3-old-stretch.png", processed, fWidth, fHeight);

console.log("saved render-1/2/3 PNGs next to script");
