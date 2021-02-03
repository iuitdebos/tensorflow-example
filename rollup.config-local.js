import serve from 'rollup-plugin-serve';
import baseConfig from './rollup.config';

export default {
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    serve({
      contentBase: ['.', 'dist/'],
      port: 3000,
    }),
  ],
};
