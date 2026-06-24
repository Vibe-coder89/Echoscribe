import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Self-executing utility to copy PWA assets on start
try {
  const iconSource = "C:\\Users\\msii\\.gemini\\antigravity\\brain\\92c993ef-153f-49e0-9e03-2a2b6608544f\\app_icon_1782192323924.png";
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (fs.existsSync(iconSource)) {
    fs.copyFileSync(iconSource, path.resolve(publicDir, 'icon-512.png'));
    fs.copyFileSync(iconSource, path.resolve(publicDir, 'icon-192.png'));
    console.log('EchoScribe: PWA app icons successfully copied to /public');
  }
} catch (error) {
  console.warn('EchoScribe: App icon copy failed', error);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
});
