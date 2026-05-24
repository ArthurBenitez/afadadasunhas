import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const outputDir = path.resolve('.output');

if (!fs.existsSync(distDir)) {
  console.error('Error: build output directory "dist" not found. Run `npm run build` first.');
  process.exit(1);
}

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}

fs.cpSync(distDir, outputDir, { recursive: true });
console.log('Copied dist -> .output');
