import * as program from 'commander';
import * as bolt from 'firebase-bolt';
import * as getStdin from 'get-stdin';

import * as pkg from '../../package.json';
import TypeScriptGenerator from '../TypeScriptGenerator';

program
    .version(pkg.version)
    .parse(process.argv)
;

getStdin()
    .then(source => {
        if (!source) {
            throw new Error('No input file.');
        }

        const {schema, paths} = bolt.parse(source);
        const generator = new TypeScriptGenerator(schema, paths);
        process.stdout.write(generator.generate());
    })
    .catch(error => process.stderr.write(error + '\n'));
