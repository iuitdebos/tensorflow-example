import scss from 'rollup-plugin-scss';
import serve from 'rollup-plugin-serve';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/js/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [
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
