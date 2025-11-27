import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Read package.json to get version
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// Plugin to inject version into service worker
const injectVersionPlugin = (mode: string): Plugin => ({
  name: 'inject-version',
  apply: 'build',
  generateBundle() {
    const swPath = path.resolve(__dirname, 'public/sw.js');
    let swContent = fs.readFileSync(swPath, 'utf-8');

    // Use timestamp for dev builds, semantic version for production
    const buildTime = new Date().toISOString();
    const version = mode === 'production'
      ? packageJson.version
      : `${packageJson.version}-dev.${Date.now()}`;

    // Replace placeholders with actual values
    swContent = swContent
      .replace(/'__APP_VERSION__'/g, `'${version}'`)
      .replace(/'__BUILD_TIME__'/g, `'${buildTime}'`);

    // Emit the processed service worker
    this.emitFile({
      type: 'asset',
      fileName: 'sw.js',
      source: swContent
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use timestamp for dev builds, semantic version for production
  const buildTime = new Date().toISOString();
  const version = mode === 'production'
    ? packageJson.version
    : `${packageJson.version}-dev.${Date.now()}`;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      injectVersionPlugin(mode),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      '__APP_VERSION__': JSON.stringify(version),
      '__BUILD_TIME__': JSON.stringify(buildTime),
    },
  };
});
