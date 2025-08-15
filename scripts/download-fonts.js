#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("📝 Vazir Font Status Check");
console.log("==========================\n");

console.log("Vazir font files for Farsi text support:");
console.log("");
console.log("Required font files in assets/fonts/:");
console.log("   - Vazir-FD-WOL.ttf (Regular)");
console.log("   - Vazir-Bold-FD-WOL.ttf (Bold)");
console.log("   - Vazir-Light-FD-WOL.ttf (Light)");
console.log("   - Vazir-Medium-FD-WOL.ttf (Medium)");
console.log("   - Vazir-Thin-FD-WOL.ttf (Thin)");
console.log("");
console.log("The app will automatically use Vazir fonts for Farsi text.");
console.log("If fonts are not available, it will fall back to system fonts.");
console.log("");

const fontsDir = path.join(__dirname, "../assets/fonts");
const requiredFonts = [
  "Vazir-FD-WOL.ttf",
  "Vazir-Bold-FD-WOL.ttf",
  "Vazir-Light-FD-WOL.ttf",
  "Vazir-Medium-FD-WOL.ttf",
  "Vazir-Thin-FD-WOL.ttf",
];

console.log("Checking current font files...\n");

if (!fs.existsSync(fontsDir)) {
  console.log("❌ Fonts directory does not exist");
  return;
}

const existingFonts = fs.readdirSync(fontsDir);
const missingFonts = requiredFonts.filter(
  (font) => !existingFonts.includes(font)
);

if (missingFonts.length === 0) {
  console.log("✅ All Vazir fonts are present!");
} else {
  console.log("❌ Missing fonts:");
  missingFonts.forEach((font) => console.log(`   - ${font}`));
}

console.log("\n📚 For more information, see assets/fonts/README.md");
