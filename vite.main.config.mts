import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Main-process build. app.js is still loaded directly by Electron, but it
// uses two modules from www/main: the settings store and the saved user
// settings (shared with the renderer, written as ES modules). This compiles
// them to CommonJS in dist/main/ for app.js to require. npm packages, Electron
// and Node built-ins stay external (an SSR build externalizes them), so they
// load from node_modules exactly as before.

const projectRoot = import.meta.dirname;

export default defineConfig({
  root: projectRoot,
  publicDir: false,
  // Keep NODE_ENV a runtime check, as in the renderer build.
  define: {
    'process.env.NODE_ENV': 'process.env.NODE_ENV',
  },
  build: {
    ssr: true,
    outDir: resolve(projectRoot, 'dist/main'),
    emptyOutDir: true,
    // Electron 44's Node.
    target: 'node24',
    minify: false,
    sourcemap: true,
    rolldownOptions: {
      input: {
        store: resolve(projectRoot, 'www/main/store.js'),
        'get-saved-user-settings': resolve(
          projectRoot,
          'www/main/common/store/user-settings/get-saved-user-settings.js',
        ),
      },
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
});
