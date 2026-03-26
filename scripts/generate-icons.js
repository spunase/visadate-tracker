/**
 * Generate all required Android and iOS app icons from the SVG source.
 * Uses sharp (bundled with Next.js) for high-quality rasterization.
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SVG_PATH = path.join(ROOT, "public", "icon.svg");
const ANDROID_RES = path.join(ROOT, "android", "app", "src", "main", "res");

// Android adaptive icon sizes (foreground needs 108dp safe zone)
// The foreground layer is 108dp x 108dp at each density
const ANDROID_SIZES = [
  { dir: "mipmap-mdpi", legacy: 48, foreground: 108 },
  { dir: "mipmap-hdpi", legacy: 72, foreground: 162 },
  { dir: "mipmap-xhdpi", legacy: 96, foreground: 216 },
  { dir: "mipmap-xxhdpi", legacy: 144, foreground: 324 },
  { dir: "mipmap-xxxhdpi", legacy: 192, foreground: 432 },
];

// Create an SVG for the foreground layer (icon content with padding for safe zone)
// Safe zone is the inner 66/108 = ~61% of the adaptive icon
function createForegroundSvg(size) {
  // The foreground canvas is `size` x `size` but only the inner ~66% is "safe"
  // We place the VD text centered in the full area
  const iconSize = Math.round(size * 0.66);
  const offset = Math.round((size - iconSize) / 2);
  const textY = offset + Math.round(iconSize * 0.68);
  const fontSize = Math.round(iconSize * 0.5);
  const rx = Math.round(iconSize * 0.19);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${offset}" y="${offset}" width="${iconSize}" height="${iconSize}" rx="${rx}" fill="#2F6BFF"/>
  <text x="${size / 2}" y="${textY}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="${fontSize}" fill="white">VD</text>
</svg>`;
}

// Create a legacy icon SVG (rounded square, full bleed)
function createLegacySvg(size) {
  const rx = Math.round(size * 0.19);
  const fontSize = Math.round(size * 0.47);
  const textY = Math.round(size * 0.66);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#2F6BFF"/>
  <text x="${size / 2}" y="${textY}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="${fontSize}" fill="white">VD</text>
</svg>`;
}

// Create a round legacy icon SVG
function createRoundSvg(size) {
  const r = size / 2;
  const fontSize = Math.round(size * 0.42);
  const textY = Math.round(size * 0.64);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${r}" cy="${r}" r="${r}" fill="#2F6BFF"/>
  <text x="${r}" y="${textY}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="${fontSize}" fill="white">VD</text>
</svg>`;
}

async function generateAndroidIcons() {
  console.log("Generating Android icons...\n");

  for (const { dir, legacy, foreground } of ANDROID_SIZES) {
    const outDir = path.join(ANDROID_RES, dir);
    fs.mkdirSync(outDir, { recursive: true });

    // Legacy launcher icon (ic_launcher.png)
    const legacySvg = Buffer.from(createLegacySvg(legacy));
    await sharp(legacySvg).png().toFile(path.join(outDir, "ic_launcher.png"));
    console.log(`  ${dir}/ic_launcher.png (${legacy}x${legacy})`);

    // Round launcher icon (ic_launcher_round.png)
    const roundSvg = Buffer.from(createRoundSvg(legacy));
    await sharp(roundSvg).png().toFile(path.join(outDir, "ic_launcher_round.png"));
    console.log(`  ${dir}/ic_launcher_round.png (${legacy}x${legacy})`);

    // Adaptive foreground (ic_launcher_foreground.png)
    const fgSvg = Buffer.from(createForegroundSvg(foreground));
    await sharp(fgSvg).png().toFile(path.join(outDir, "ic_launcher_foreground.png"));
    console.log(`  ${dir}/ic_launcher_foreground.png (${foreground}x${foreground})`);
  }

  console.log("\nAndroid icons generated successfully!");
}

async function generateWebIcons() {
  console.log("\nGenerating web icons...\n");

  const publicDir = path.join(ROOT, "public");

  // 192x192 for web manifest
  const svg192 = Buffer.from(createLegacySvg(192));
  await sharp(svg192).png().toFile(path.join(publicDir, "icon-192.png"));
  console.log("  icon-192.png (192x192)");

  // 512x512 for web manifest
  const svg512 = Buffer.from(createLegacySvg(512));
  await sharp(svg512).png().toFile(path.join(publicDir, "icon-512.png"));
  console.log("  icon-512.png (512x512)");

  // 1024x1024 for app store submissions
  const svg1024 = Buffer.from(createLegacySvg(1024));
  await sharp(svg1024).png().toFile(path.join(publicDir, "icon-1024.png"));
  console.log("  icon-1024.png (1024x1024) - for App Store");

  console.log("\nWeb icons generated successfully!");
}

async function main() {
  try {
    await generateAndroidIcons();
    await generateWebIcons();
    console.log("\nAll icons generated!");
  } catch (err) {
    console.error("Error generating icons:", err);
    process.exit(1);
  }
}

main();
