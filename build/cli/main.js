"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const getStdin = require("get-stdin");
const bolt = require("firebase-bolt");
const TypeScriptGenerator_1 = require("../TypeScriptGenerator");
const pkg = require("../../package.json");
program
    .version(pkg.version)
    .parse(process.argv);
getStdin()
    .then(source => {
    if (!source) {
        throw new Error("No input file.");
    }
    const { schema, paths } = bolt.parse(source);
    const generator = new TypeScriptGenerator_1.default(schema, paths);
    process.stdout.write(generator.generate());
})
    .catch(error => process.stderr.write(error + "\n"));
//# sourceMappingURL=main.js.map