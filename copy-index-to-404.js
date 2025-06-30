import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 在构建后将 index.html 复制为 404.html
const distPath = path.resolve(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');

// 确保 dist 目录存在
if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('Successfully copied index.html to 404.html');
} else {
  console.error('Error: dist directory or index.html not found');
}