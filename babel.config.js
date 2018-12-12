module.exports = {
  'plugins': [
    [
      '@babel/plugin-proposal-class-properties',
      {
        'loose': true
      }
    ]
  ],
  'presets': [
    [
      '@babel/preset-env',
      {
        'targets': {
          'chrome': 61,
          'electron': '2.0.9'
        },
        'modules': false,
        'useBuiltIns': 'usage'
      }
    ],
    '@babel/preset-react'
  ],
  'env': {
    'production': {},
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
