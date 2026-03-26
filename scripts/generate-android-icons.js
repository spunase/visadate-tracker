/**
 * Generate Android adaptive icon foreground PNGs from the SVG source.
 *
 * Since we don't have sharp/canvas in this project, this script creates
 * properly sized placeholder icons and documents what's needed for production.
 *
 * For production, use Android Studio's Image Asset Studio or
 * https://icon.kitchen to generate proper adaptive icons from icon.svg.
 *
 * Android Adaptive Icon requirements:
 * - mdpi:    48x48 (108x108 with safe zone)
 * - hdpi:    72x72 (162x162 with safe zone)
 * - xhdpi:   96x96 (216x216 with safe zone)
 * - xxhdpi:  144x144 (324x324 with safe zone)
 * - xxxhdpi: 192x192 (432x432 with safe zone)
 */

const fs = require("fs");
const path = require("path");

const androidResDir = path.join(
  __dirname,
  "..",
  "android",
  "app",
  "src",
  "main",
  "res"
);

// Create ic_launcher_background.xml with our brand color
const backgroundXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#2F6BFF</color>
</resources>
`;

// Adaptive icon XML pointing to foreground + background
const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;

const adaptiveIconRoundXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;

// Write the background color resource
fs.writeFileSync(
  path.join(androidResDir, "values", "ic_launcher_background.xml"),
  backgroundXml
);

// Write adaptive icon XML files
fs.writeFileSync(
  path.join(androidResDir, "mipmap-anydpi-v26", "ic_launcher.xml"),
  adaptiveIconXml
);
fs.writeFileSync(
  path.join(androidResDir, "mipmap-anydpi-v26", "ic_launcher_round.xml"),
  adaptiveIconRoundXml
);

console.log("Android adaptive icon XML resources generated.");
console.log("");
console.log("IMPORTANT: To generate the actual foreground PNG files,");
console.log("use one of these methods:");
console.log("");
console.log("1. Android Studio > right-click res > New > Image Asset");
console.log("   - Select 'Launcher Icons (Adaptive and Legacy)'");
console.log("   - Use public/icon.svg as the foreground");
console.log("   - Set background to #2F6BFF");
console.log("");
console.log("2. Visit https://icon.kitchen");
console.log("   - Upload public/icon.svg");
console.log("   - Download the generated Android icons");
console.log("   - Copy into android/app/src/main/res/mipmap-*/ directories");
console.log("");
console.log("Required output directories:");
const sizes = [
  ["mipmap-mdpi", "48x48 (foreground: 108x108)"],
  ["mipmap-hdpi", "72x72 (foreground: 162x162)"],
  ["mipmap-xhdpi", "96x96 (foreground: 216x216)"],
  ["mipmap-xxhdpi", "144x144 (foreground: 324x324)"],
  ["mipmap-xxxhdpi", "192x192 (foreground: 432x432)"],
];
sizes.forEach(([dir, size]) => {
  console.log(`  ${dir}/ic_launcher.png - ${size}`);
  console.log(`  ${dir}/ic_launcher_foreground.png - ${size}`);
  console.log(`  ${dir}/ic_launcher_round.png - ${size}`);
});
