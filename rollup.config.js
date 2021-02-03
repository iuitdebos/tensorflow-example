import scss from 'rollup-plugin-scss';
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
    commonjs({ sourceMap: false }),
    babel({
      babelHelpers: 'bundled',
    }),
    scss({
      output: 'dist/style.css',
    }),
  ],
};
