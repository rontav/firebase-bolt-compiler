"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class TypeScriptGenerator {
    constructor(schemas, paths) {
        this.atomicTypes = {
            Any: "any",
            Boolean: "boolean",
            Number: "number",
            Null: "void",
            Object: "Object",
            String: "string"
        };
        this.schemas = schemas;
        this.paths = paths;
        // console.log(JSON.stringify(paths, null ,4));
        Object.entries(schemas).forEach(([name, schema]) => {
            const type = schema.derivedFrom;
            if (type.name && this.derivesFromAtomic(type)) {
                this.atomicTypes[name] = this.serializeTypeName(type.name);
            }
        });
    }
    pathsToInterface(root) {
        const childKeys = Object.keys(root).filter(key => !['type', 'path'].includes(key));
        if (root.type && Object.keys(childKeys).length === 0) {
            return this.serialize(root.type.isType);
        }
        let output = [];
        let wildcardAndChildren = {};
        if (childKeys.length > 0
            && (childKeys.length > 1
                || childKeys[0][0] !== '$')) {
            output.push('{');
        }
        for (let key of childKeys) {
            let childValue = this.pathsToInterface(root[key]);
            if (key[0] === '$') {
                let value = `Record<string, ${childValue}>`;
                if (childKeys.length > 1) {
                    wildcardAndChildren = {
                        key,
                        value
                    };
                }
                else {
                    output.push(value);
                }
            }
            else {
                output.push(`${key}?: ${childValue}`);
            }
        }
        if (wildcardAndChildren.key) {
            output.push(`} & ${wildcardAndChildren.value}`);
        }
        else {
            if (childKeys.length > 0
                && (childKeys.length > 1
                    || childKeys[0][0] !== '$')) {
                output.push('}');
            }
        }
        if (root.type && this.serialize(root.type.isType) !== 'any') {
            if (output.length) {
                output[0] = `OmitIfDeclaredByParentAndAny<${output[0]}`;
                output[output.length - 1] += `, ${this.serialize(root.type.isType)}> & ${this.serialize(root.type.isType)}`;
            }
            else {
                output = [`${this.serialize(root.type.isType)}`];
            }
        }
        if (!output.length) {
            output = ['any'];
        }
        return output.join('\n');
    }
    generate() {
        // const paths = this.paths.map(path => this.serializePath(path)).join("\n\n") + "\n\n";
        const root = {
            path: '/'
        };
        this.paths.forEach(path => {
            let current = root;
            let last = current;
            let lastPathPart;
            if (Array.isArray(path.template.parts)) {
                for (let pathPart of path.template.parts) {
                    if (!current[pathPart.label]) {
                        current[pathPart.label] = {};
                    }
                    last = current;
                    lastPathPart = pathPart.label;
                    current = current[pathPart.label];
                    current.path = last.path + pathPart.label + '/';
                }
            }
            if (path.isType) {
                last[lastPathPart].type = path;
            }
        });
        let pathTypes = `import {A, O} from 'ts-toolbelt';`;
        pathTypes += `

type OmitIfDeclaredByParentAndAny<T, U> = O.Filter<{
    [P in keyof T]:
        P extends keyof U
        ? A.Equals<T[P], any> extends 1
        ? never
        : T[P] extends Record<string, any>
        ? OmitIfDeclaredByParentAndAny<T[P], U[P]>
        : T[P]
        : T[P]
}, never, 'equals'>;

`;
        pathTypes += 'export interface dbPaths ' + this.pathsToInterface(root);
        // console.log('const paths = '+JSON.stringify(root, null, 4));
        const types = (Object.entries(this.schemas).map(([name, schema]) => this.serializeSchema(name, schema))
            .join("\n\n")
            .trim());
        return types + '\n\n' + pathTypes;
    }
    serializeTypeName(name) {
        return this.atomicTypes[name] || name;
    }
    serialize(type) {
        if (type.params) {
            return this.serializeGenericType(type);
        }
        else if (type.types) {
            return this.serializeUnionType(type);
        }
        else {
            return this.serializeSimpleType(type);
        }
    }
    serializeSimpleType(type) {
        return this.serializeTypeName(type.name);
    }
    serializeUnionType(type) {
        const types = type.types.map(t => this.serialize(t));
        const uniqueTypes = [...new Set(types)];
        return uniqueTypes.filter(t => t !== "void").join(" | ");
    }
    serializeGenericType(type) {
        return type.name === "Map"
            ?
                `{ [key: string]: ${this.serialize(type.params[1])} }`
            :
                this.serializeGenericTypeRef(type);
    }
    serializeGenericTypeRef(type) {
        const typeName = this.serializeTypeName(type.name);
        const params = type.params.map(param => this.serialize(param)).join(", ");
        return `${typeName}<${params}>`;
    }
    serializeRef(type) {
        if (type.params) {
            return this.serializeGenericTypeRef(type);
        }
        else if (type.types) {
            throw new Error();
        }
        else {
            return type.name;
        }
    }
    derivesFromMap(type) {
        return type.name === "Map";
    }
    derivesFromAtomic(type) {
        return this.atomicTypes[type.name] !== undefined && type.name !== "Object";
    }
    derives(schema) {
        const type = this.serializeRef(schema.derivedFrom);
        if (type !== "Object") {
            return `extends ${type} `;
        }
        else {
            return ``;
        }
    }
    isNullable(type) {
        const union = type;
        if (union.types) {
            const isNullable = _.some(union.types, (t) => t.name === "Null");
            return isNullable ? "?" : "";
        }
        return "";
    }
    serializeSchema(name, schema) {
        if (this.derivesFromMap(schema.derivedFrom)) {
            return `export type ${name} = ${this.serializeGenericType(schema.derivedFrom)};`;
        }
        else if (!this.derivesFromAtomic(schema.derivedFrom)) {
            return `export interface ${name} ${this.derives(schema)}{
${_.map(schema.properties, (prop, propName) => `    ${propName}${this.isNullable(prop)}: ${this.serialize(prop)};`).join("\n")}
}`;
        }
        else {
            return "";
        }
    }
}
exports.default = TypeScriptGenerator;
//# sourceMappingURL=TypeScriptGenerator.js.map