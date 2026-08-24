import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");

async function getFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return files.flat();
}

async function optimizeImages() {
  console.log(`Scanning directory: ${PUBLIC_DIR}...`);
  const allFiles = await getFiles(PUBLIC_DIR);
  const imageFiles = allFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".jpg", ".jpeg", ".png"].includes(ext) && !f.endsWith(".ico") && !f.endsWith(".webp");
  });

  console.log(`Found ${imageFiles.length} images to optimize.\n`);

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (const filePath of imageFiles) {
    const originalStat = await fs.promises.stat(filePath);
    const originalSize = originalStat.size;
    totalOriginalBytes += originalSize;

    const ext = path.extname(filePath).toLowerCase();
    const relativePath = path.relative(PUBLIC_DIR, filePath);

    try {
      // Read completely into memory to prevent Windows file lock issues
      const inputBuffer = await fs.promises.readFile(filePath);
      const metadata = await sharp(inputBuffer).metadata();

      let pipeline = sharp(inputBuffer).rotate();

      // Resize if overly large (> 2048px)
      if (metadata.width > 2048 || metadata.height > 2048) {
        pipeline = pipeline.resize({
          width: metadata.width >= metadata.height ? 2048 : undefined,
          height: metadata.height > metadata.width ? 2048 : undefined,
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      let optimizedBuffer;
      if (ext === ".png") {
        optimizedBuffer = await pipeline
          .png({ compressionLevel: 9, quality: 85, effort: 7 })
          .toBuffer();
      } else {
        optimizedBuffer = await pipeline
          .jpeg({ quality: 82, progressive: true, mozjpeg: true })
          .toBuffer();
      }

      // Also create a modern WebP version alongside
      const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, ".webp");
      const webpBuffer = await sharp(inputBuffer)
        .rotate()
        .resize({
          width: metadata.width > 2048 ? 2048 : undefined,
          height: metadata.height > 2048 ? 2048 : undefined,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82, effort: 6 })
        .toBuffer();
      await fs.promises.writeFile(webpPath, webpBuffer);

      // If optimized image is smaller, replace original
      if (optimizedBuffer.length < originalSize) {
        await fs.promises.writeFile(filePath, optimizedBuffer);
        totalOptimizedBytes += optimizedBuffer.length;
        const savedPercent = (((originalSize - optimizedBuffer.length) / originalSize) * 100).toFixed(1);
        console.log(
          `✔ ${relativePath}: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(optimizedBuffer.length / 1024 / 1024).toFixed(2)} MB (${savedPercent}% saved) [+ WebP: ${(webpBuffer.length / 1024).toFixed(1)} KB]`
        );
      } else {
        totalOptimizedBytes += originalSize;
        console.log(`- ${relativePath}: Already optimal (${(originalSize / 1024).toFixed(1)} KB) [+ WebP: ${(webpBuffer.length / 1024).toFixed(1)} KB]`);
      }
    } catch (err) {
      console.error(`✖ Error processing ${relativePath}:`, err);
      totalOptimizedBytes += originalSize;
    }
  }

  const totalSaved = totalOriginalBytes - totalOptimizedBytes;
  console.log("\n=================================");
  console.log(`Original total:  ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized total: ${(totalOptimizedBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${(((totalSaved) / totalOriginalBytes) * 100).toFixed(1)}%)`);
  console.log("=================================\n");
}

optimizeImages();
