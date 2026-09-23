import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import renderer from 'vite-plugin-electron-renderer';

// Renderer build for the main, viewer and overlay windows.
//
// The windows still run with nodeIntegration, so Vite only bundles the app's
// own code (www/main). Every npm dependency, Electron and Node built-ins stay
// external and are loaded with Node's require() at runtime, exactly as before
// Vite: packages keep their Node builds (not their browser builds) and React
// is a single copy.
//
// Dev: `npm run dev:renderer` serves www/ and the windows load from the dev
// server (see app.js). Build: www/dist/<entry>.js, loaded by the HTML files.

const projectRoot = import.meta.dirname;

const { dependencies } = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
};

// Deep imports the renderer uses, which need their own shim.
const subpathImports = ['react-dom/client'];

const nodeLoaded = Object.fromEntries(
  [...Object.keys(dependencies), ...subpathImports].map((name) => [name, { type: 'cjs' as const }]),
);

export default defineConfig({
  root: resolve(projectRoot, 'www'),
  base: './',
  publicDir: false,
  // Keep NODE_ENV a runtime check, as with Babel: dev runs (NODE_ENV=development)
  // use the staging API, the packaged app production. Vite would otherwise bake
  // the build mode in.
  define: {
    'process.env.NODE_ENV': 'process.env.NODE_ENV',
  },
  plugins: [
    // Match the Babel setup: classic runtime, every JSX file imports React.
    react({ jsxRuntime: 'classic' }),
    renderer({ resolve: nodeLoaded }),
  ],
  build: {
    outDir: resolve(projectRoot, 'www/dist'),
    emptyOutDir: true,
    // Loaded from disk by Electron 44 (Chromium 152).
    target: 'chrome140',
    sourcemap: true,
    // Readable stack traces, like the unminified Babel output this replaces.
    minify: false,
    rolldownOptions: {
      input: {
        main: resolve(projectRoot, 'www/main/entries/main.jsx'),
        viewer: resolve(projectRoot, 'www/main/entries/viewer.jsx'),
        overlay: resolve(projectRoot, 'www/main/entries/overlay.jsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
