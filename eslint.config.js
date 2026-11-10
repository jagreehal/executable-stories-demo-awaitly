import babelParser from '@babel/eslint-parser';
import awaitly from 'eslint-plugin-awaitly';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-typescript'],
        },
      },
    },
  },
  ...awaitly.configs.recommended,
];
