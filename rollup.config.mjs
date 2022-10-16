import { externalModules } from '@run-z/rollup-helpers';
import path from 'node:path';
import { defineConfig } from 'rollup';
import flatDts from 'rollup-plugin-flat-dts';
import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';

export default defineConfig({
  input: {
    wesib: './src/index.ts',
    'wesib.testing': './src/testing/index.ts',
  },
  plugins: [
    ts({
      typescript,
      tsconfig: 'tsconfig.main.json',
      cacheRoot: 'target/.rts2_cache',
      useTsconfigDeclarationDir: true,
    }),
  ],
  external: externalModules(),
  output: {
    dir: '.',
    format: 'esm',
    sourcemap: true,
    entryFileNames: 'dist/[name].js',
    chunkFileNames: 'dist/_[name].js',
    manualChunks(id) {
      if (id.startsWith(path.resolve('src', 'testing') + path.sep)) {
        return 'wesib.testing';
      }

      return 'wesib';
    },
    plugins: [
      flatDts({
        tsconfig: 'tsconfig.main.json',
        lib: true,
        compilerOptions: {
          declarationMap: true,
        },
        entries: {
          testing: {
            file: 'testing/index.d.ts',
          },
        },
        internal: ['**/impl/**', '**/*.impl'],
      }),
    ],
  },
});
