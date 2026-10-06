import { defineConfig } from 'tsdown';

export default defineConfig({
  format: 'esm',
  platform: 'browser',
  target: 'es2023',
  entry: ['./src/tunit/index.ts', './src/tunit/ui/index.ts', './src/ui/index.ts'],
  unbundle: true,
  dts: {
    sourcemap: false,
  },
  sourcemap: false,
  deps: {
    neverBundle: [/^node:/, 'fs'],
  },
  exports: {
    enabled: true,
    packageJson: false,
    customExports(exports) {
      return { ...exports, './css/*': './css/*' };
    },
  },
});
