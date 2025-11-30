// create-icons-windows.js
// Run with: node create-icons-windows.js

const fs = require("fs");
const path = require("path");
const sharp = require("sharp"); // requires: npm install sharp

console.log("🎨 Generating PWA icons from icon-512.jpg...\n");

const publicDir = path.join(process.cwd(), "public");
const baseImage = path.join(publicDir, "icon-512.jpg");

if (!fs.existsSync(publicDir)) {
  console.error("❌ public/ directory not found.");
  process.exit(1);
}

if (!fs.existsSync(baseImage)) {
  console.error("❌ Missing base image: public/icon-512.jpg");
  console.error("   Please place a high-resolution image here.");
  process.exit(1);
}

// Standard icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

(async () => {
  console.log("📦 Creating standard icons...");
  for (const size of sizes) {
    const outputFile = path.join(publicDir, `icon-${size}.png`);
    await sharp(baseImage).resize(size, size).png().toFile(outputFile);
    console.log(`  ✓ icon-${size}.png`);
  }

  // Maskable icons (requires transparent padding)
  console.log("\n📦 Creating maskable icons...");
  for (const size of [192, 512]) {
    const pad = Math.round(size * 0.1); // FIX: sharp requires integers

    const outputFile = path.join(publicDir, `icon-maskable-${size}.png`);
    await sharp(baseImage)
      .resize(size, size)
      .extend({
        top: pad,
        bottom: pad,
        left: pad,
        right: pad,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent
      })
      .png()
      .toFile(outputFile);

    console.log(`  ✓ icon-maskable-${size}.png`);
  }

  // Apple Touch Icon
  console.log("\n📦 Creating Apple Touch Icon (180×180)...");
  await sharp(baseImage)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("  ✓ apple-touch-icon.png");

  // Favicon
  console.log("\n📦 Creating favicon (32×32)...");
  await sharp(baseImage)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, "favicon.ico"));
  console.log("  ✓ favicon.ico");

  console.log("\n✅ All icons generated successfully!");
  console.log("📁 Saved in:", publicDir);
  console.log("\n🚀 Next steps:");
  console.log("   1. Stop dev server (Ctrl+C)");
  console.log("   2. Run: npm run dev");
  console.log("   3. Reload http://localhost:3000\n");
})();
