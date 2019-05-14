module.exports = {
  'plugins': [
    [
      '@babel/plugin-proposal-class-properties',
      {
        'loose': true
      }
    ],
    [
      '@babel/plugin-proposal-object-rest-spread',
      {
        'loose': true
      }
    ],
    ['@babel/plugin-transform-runtime']
  ],
  'presets': [
    [
      '@babel/preset-env',
      {
        'targets': {
          'chrome': 61,
          'electron': '2.0.9'
        },
        'modules': 'commonjs',
        'useBuiltIns': 'usage'
      }
    ],
    '@babel/preset-react'
  ],
  'env': {
    'production': {
      'ignore': ['**/*.spec.js']
    },
    'test': {
      'presets': [
        [
          '@babel/preset-env',
          {
            'modules': 'commonjs'
          }
        ]
      ]
    }
  }
}
