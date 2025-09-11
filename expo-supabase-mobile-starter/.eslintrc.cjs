module.exports = {
  root: true,
  extends: ['./.eslintrc.json'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: 'lib/theme/index', message: 'DEPRECATED – import from @theme/tokens instead.' },
          { name: '../lib/theme/index', message: 'DEPRECATED – import from @theme/tokens instead.' },
          { name: '../../lib/theme/index', message: 'DEPRECATED – import from @theme/tokens instead.' },
          { name: 'lib/theme/_deprecated/index', message: 'DEPRECATED – import from @theme/tokens instead.' },
          { name: '../lib/theme/_deprecated/index', message: 'DEPRECATED – import from @theme/tokens instead.' },
          { name: '../../lib/theme/_deprecated/index', message: 'DEPRECATED – import from @theme/tokens instead.' }
        ],
        patterns: ['**/lib/theme/index', '**/lib/theme/_deprecated/**']
      }
    ]
  }
};