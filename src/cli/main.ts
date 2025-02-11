import * as program from 'commander';
import * as bolt from 'firebase-bolt';
import * as getStdin from 'get-stdin';

import TypeScriptGenerator from '../TypeScriptGenerator';

const pkg = require('../../package.json');

program
    .version(pkg.version)
    .option('-t, --type-prefix [prefix]', 'prefix added to types; default: T_')
    .parse(process.argv);

getStdin()
    .then(source => {
        if (!source) {
            throw new Error('No input file.');
        }

        const {schema, paths} = bolt.parse(source);
        const generator = new TypeScriptGenerator(schema, paths, {
            typePrefix: program.typePrefix || 'T_',
        });
        process.stdout.write(generator.generate());
    })
    .catch(error => process.stderr.write(error + '\n'));
