module.exports = {
  plugins: [
    ['@babel/plugin-transform-class-properties', {loose: true}],
    ['@babel/plugin-transform-object-rest-spread', {loose: true}],
    ['@babel/plugin-transform-private-methods', {loose: true}],
    ['add-module-exports', {addDefaultProperty: true}],
    ['@babel/plugin-transform-private-property-in-object', {loose: true}],
    ['@babel/plugin-transform-runtime'],
  ],
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {browsers: '> 5%'},
        modules: 'commonjs',
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    ['@babel/preset-react', {runtime: 'automatic'}],
  ],
}
