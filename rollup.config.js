import scss from 'rollup-plugin-scss';

export default {
  input: 'src/js/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [
    scss({
      output: 'dist/style.css',
    }),
  ],
};
