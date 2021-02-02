import scss from 'rollup-plugin-scss';
import serve from 'rollup-plugin-serve';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/js/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
    }),
    scss({
      output: 'dist/style.css',
    }),
    serve({
      contentBase: ['.', 'dist/'],
      port: 3000,
    }),
  ],
};
