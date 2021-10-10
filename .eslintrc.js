const path = require('path');

module.exports = {
    root: true,
    env: {
        'node': true,
        'es6': true,
    },
    extends: [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        'ecmaVersion': 2018,
        'sourceType': 'module',
        'requireConfigFile': false,
    },
    settings: {
        'import/resolver': {
            'node': {
                'extensions': ['.js', '.ts'],
            },
        },
    },
    plugins: [
        '@typescript-eslint',
    ],
    rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        '@typescript-eslint/type-annotation-spacing': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/member-delimiter-style': [
            'error', {
                'multiline': {
                    'delimiter': 'comma',
                    'requireLast': true,
                },
            },
        ],
        '@typescript-eslint/no-var-requires': 'off',

        'brace-style': 'off',
        '@typescript-eslint/brace-style': ['error', 'stroustrup'],
        'comma-spacing': 'off',
        '@typescript-eslint/comma-spacing': 'error',
        'comma-dangle': 'off',
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
        'no-extra-parens': 'off',
        '@typescript-eslint/no-extra-parens': ['error', 'functions'],
        'func-call-spacing': 'off',
        '@typescript-eslint/func-call-spacing': ['error', 'never'],
        'keyword-spacing': 'off',
        '@typescript-eslint/keyword-spacing': 'error',
        'no-duplicate-imports': 'off',
        '@typescript-eslint/no-duplicate-imports': 'error',
        'no-extra-semi': 'off',
        '@typescript-eslint/no-extra-semi': 'error',
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': 'error',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': 'error',
        'quotes': 'off',
        '@typescript-eslint/quotes': ['error', 'single'],
        'space-before-function-paren': 'off',
        '@typescript-eslint/space-before-function-paren': [
            'error',
            {
                'anonymous': 'never',
                'named': 'never',
                'asyncArrow': 'always',
            },
        ],
        'space-infix-ops': 'off',
        '@typescript-eslint/space-infix-ops': 'error',

        'semi': 'off',
        '@typescript-eslint/semi': ['error', 'always'],
        'object-curly-spacing': 'off',
        '@typescript-eslint/object-curly-spacing': ['error', 'never'],

        'import/named': 'off',
        'import/order': [
            'error',
            {
                groups: [
                    ['builtin', 'external'],
                    ['internal'],
                    ['parent'],
                    ['sibling', 'index'],
                    'object',
                ],
                warnOnUnassignedImports: true,
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                'newlines-between': 'always',
            },
        ],
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-unassigned-import': 'error',
        'import/no-mutable-exports': 'error',
        'import/no-unresolved': 'error',
        'import/namespace': 'off',
        'function-paren-newline': ['error', 'multiline-arguments'],
        'operator-linebreak': [
            'error',
            'before',
            {
                'overrides': {
                    '?': 'ignore',
                    ':': 'ignore',
                },
            },
        ],
        'no-unreachable': 'error',
        'no-multiple-empty-lines': 'error',
        'no-empty': [
            'error',
            {
                'allowEmptyCatch': true,
            },
        ],
        'no-empty-function': 'off',
        'no-return-await': 'error',
        'no-spaced-func': 'error',
        'no-unneeded-ternary': 'error',
        'prefer-arrow-callback': 'error',
        'prefer-promise-reject-errors': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'require-await': 'error',
        'no-bitwise': 'error',
        'indent': ['error', 4],
        'no-console': 'error',
        'camelcase': [
            'warn',
            {
                allow: [
                    'user_uid',
                    'user_id',
                    'access_token',
                    'client_id',
                ],
            },
        ],
        'arrow-spacing': 'error',
        'object-curly-newline': [
            'error',
            {
                'ObjectExpression': {
                    'multiline': true,
                    'consistent': true,
                },
                'ObjectPattern': {
                    'multiline': true,
                    'consistent': true,
                },
                'ImportDeclaration': {
                    'multiline': true,
                    'minProperties': 10,
                    'consistent': true,
                },
                'ExportDeclaration': {
                    'multiline': true,
                    'consistent': true,
                },
            },
        ],
        'object-property-newline': [
            'error',
            {
                'allowAllPropertiesOnSameLine': true,
            },
        ],
        'no-trailing-spaces': 'error',
        'no-multi-spaces': 'error',
        'object-shorthand': 'error',
        'key-spacing': 'error',
        'space-before-blocks': 'error',
        'array-bracket-spacing': ['error', 'never'],
        'space-in-parens': ['error', 'never'],
        'linebreak-style': ['error', 'unix'],
        'eqeqeq': 'error',
    },
};