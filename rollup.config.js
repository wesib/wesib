import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

function makeConfig(baseConfig, ...configs) {
  return configs.reduce(
      (prev, config) => ({
        ...prev,
        ...config,
        plugins: config.plugins ? [ ...prev.plugins, ...config.plugins ] : prev.plugins,
        output: { ...prev.output, ...config.output },
      }),
      baseConfig);
}

function baseConfig(tsconfig) {
  return {
    plugins: [
      commonjs(),
      typescript({
        typescript: require('typescript'),
        tsconfig: tsconfig,
        cacheRoot: 'target/.rts2_cache',
        useTsconfigDeclarationDir: true,
      }),
      nodeResolve({
        jsnext: true,
        main: false,
        preferBuiltins: false,
      }),
      sourcemaps(),
    ],
    input: './src/index.ts',
    external: [
      'a-iterable',
      'call-thru',
      'context-values',
      'fun-events',
      'tslib',
    ],
    output: {
      format: 'umd',
      sourcemap: true,
      name: 'wesib',
      globals: {
        'a-iterable': 'aIterable',
        'call-thru': 'callThru',
        'context-values': 'contextValues',
        'fun-events': 'funEvents',
        'tslib': 'tslib',
      },
    },
  };
}

const mainConfig = makeConfig(
    baseConfig('tsconfig.main.json'),
    {
      output: {
        file: pkg.main,
      },
    });

const umdConfig = makeConfig(
    baseConfig('tsconfig.umd.json'),
    {
      output: {
        file: pkg.browser,
      },
    });

const esmConfig = makeConfig(
    baseConfig('tsconfig.esm.json'),
    {
      output: {
        format: 'esm',
        file: pkg.module,
      },
    });

const esm5Config = makeConfig(
    baseConfig('tsconfig.umd.json'),
    {
      output: {
        format: 'esm',
        file: pkg.esm5,
      },
    });

export default [
  mainConfig,
  umdConfig,
  esmConfig,
  esm5Config,
]
