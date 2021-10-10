import {Path, Schemas, ExpType, ExpGenericType, ExpUnionType, ExpSimpleType, Schema} from 'firebase-bolt';
import * as _ from 'lodash';

export default class TypeScriptGenerator {
    private schemas: Schemas;
    private paths: Path[];

    private regexTypes: {[type: string]: string} = {};
    private atomicTypes: {[type: string]: string} = {
        Any: 'any',
        Boolean: 'boolean',
        Number: 'number',
        Null: 'void',
        Object: 'Object',
        String: 'string',
        Timestamp: 'number | TServerTimestamp',
    };

    constructor(schemas: Schemas, paths: Path[]) {
        this.schemas = schemas;
        this.paths = paths;

        // console.log(JSON.stringify(schemas, null ,4));
        // console.log(JSON.stringify(paths, null ,4));

        Object.entries(schemas).forEach(([name, schema]) => {
            const type = schema.derivedFrom as ExpSimpleType;

            if (type.name && this.derivesFromAtomic(type) && !this.atomicTypes[name]) {
                if (type.name === 'String' && schema?.methods?.validate?.body?.args?.[0]?.type === 'RegExp') {
                    const regexValue = schema.methods.validate.body.args[0].value;

                    if (regexValue.match(/^((?:[a-zA-Z \\+-]+\|?)+)$/)) {
                        const regexParts = regexValue.split('|');

                        this.regexTypes[name] = regexParts.map(part => `"${part}"`).join(' | ');
                        this.atomicTypes[name] = name;
                    }
                }

                if (!this.atomicTypes[name]) {
                    this.atomicTypes[name] = this.serializeTypeName(type.name);
                }
            }
        });
    }

    pathsToInterface(root: Record<string, any>): string {
        const childKeys = Object.keys(root).filter(key => !['type', 'path'].includes(key));

        if (root.type && Object.keys(childKeys).length === 0) {
            return this.serialize(root.type.isType);
        }

        let output = [];

        let wildcardAndChildren: {
            key?: string,
            value?: string,
        } = {};

        if (
            childKeys.length > 0
            && (
                childKeys.length > 1
                || childKeys[0][0] !== '$'
            )
        ) {
            output.push('{');
        }

        for (const key of childKeys) {
            const childValue = this.pathsToInterface(root[key]);

            if (key[0] === '$') {
                const value = `Record<string, ${childValue}>`;

                if (childKeys.length > 1) {
                    wildcardAndChildren = {
                        key,
                        value,
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
            if (
                childKeys.length > 0
                && (
                    childKeys.length > 1
                    || childKeys[0][0] !== '$'
                )
            ) {
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

    generate(): string {
        // const paths = this.paths.map(path => this.serializePath(path)).join("\n\n") + "\n\n";
        const root: Record<string, any> = {
            path: '/',
        };

        this.paths.forEach(path => {
            let current = root;
            let last = current;
            let lastPathPart;

            if (Array.isArray(path.template.parts)) {
                for (const pathPart of path.template.parts) {
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

        const regexTypesDefinitions = [];
        Object.entries(this.regexTypes).forEach(([name, typeDefinition]) => {
            regexTypesDefinitions.push(`type ${name} = ${typeDefinition};`);
        });

        let pathTypes = 'import {A, O} from \'ts-toolbelt\';';
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

export type TServerTimestamp = {'.sv': 'timestamp'};
`;
        pathTypes += 'export interface dbPaths ' + this.pathsToInterface(root);

        // console.log('const paths = '+JSON.stringify(root, null, 4));

        const types = (
            Object.entries(this.schemas).map(([name, schema]) => this.serializeSchema(name, schema))
                .join('\n\n')
                .trim()
        );

        return regexTypesDefinitions.join('\n') + '\n\n' + types + '\n\n' + pathTypes;
    }

    private serializeTypeName(name: string): string {
        return this.atomicTypes[name] || name;
    }

    private serialize(type: ExpType): string {
        if ((type as ExpGenericType).params) {
            return this.serializeGenericType(type as ExpGenericType);
        }
        else if ((type as ExpUnionType).types) {
            return this.serializeUnionType(type as ExpUnionType);
        }
        else {
            return this.serializeSimpleType(type as ExpSimpleType);
        }
    }

    private serializeSimpleType(type: ExpSimpleType): string {
        return this.serializeTypeName(type.name);
    }

    private serializeUnionType(type: ExpUnionType): string {
        const types = type.types.map(t => this.serialize(t));
        const uniqueTypes = [...new Set(types)];
        return uniqueTypes.filter(t => t !== 'void').join(' | ');
    }

    private serializeGenericType(type: ExpGenericType): string {
        const keyType = this.serialize(type.params[0]);

        return type.name === 'Map'
            ?
            `{ [${keyType === 'string' ? 'key: string' : `key in ${keyType}`}]: ${this.serialize(type.params[1])} }`
            :
            this.serializeGenericTypeRef(type);
    }

    private serializeGenericTypeRef(type: ExpGenericType): string {
        const typeName = this.serializeTypeName(type.name);
        const params = type.params.map(param => this.serialize(param)).join(', ');
        return `${typeName}<${params}>`;
    }

    private serializeRef(type: ExpType): string {
        if ((type as ExpGenericType).params) {
            return this.serializeGenericTypeRef(type as ExpGenericType);
        }
        else if ((type as ExpUnionType).types) {
            throw new Error();
        }
        else {
            return (type as ExpSimpleType).name;
        }
    }

    private derivesFromMap(type: ExpGenericType): boolean {
        return type.name === 'Map';
    }

    private derivesFromAtomic(type: ExpSimpleType): boolean {
        return this.atomicTypes[type.name] !== undefined && type.name !== 'Object';
    }

    private derives(schema: Schema): string {
        const type = this.serializeRef(schema.derivedFrom);
        if (type !== 'Object') {
            return `extends ${type} `;
        }
        else {
            return '';
        }
    }

    private isNullable(type: ExpType): string {
        const union = type as ExpUnionType;
        if (union.types) {
            const isNullable = _.some(union.types, (t: ExpSimpleType) => t.name === 'Null');
            return isNullable ? '?' : '';
        }
        return '';
    }

    private serializeSchema(name: string, schema: Schema): string {
        if (this.derivesFromMap(schema.derivedFrom as ExpGenericType)) {
            return `export type ${name} = ${this.serializeGenericType(schema.derivedFrom as ExpGenericType)};`;
        }
        else if (!this.derivesFromAtomic(schema.derivedFrom as ExpSimpleType)) {
            return `export interface ${name} ${this.derives(schema)}{
${
    _.map(
        schema.properties,
        (prop, propName) => `    ${propName}${this.isNullable(prop)}: ${this.serialize(prop)};`,
    ).join('\n')
}
}`;
        }
        else {
            return '';
        }
    }
}
