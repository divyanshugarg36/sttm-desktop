// @electron/remote, loaded with require(). In development the Vite renderer
// plugin can only shim this package with a default export (it can't be loaded
// outside Electron to list its exports), so `import * as remote` finds nothing
// there; require() works under both the dev server and the build.
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
export const remote = require('@electron/remote') as typeof import('@electron/remote');
