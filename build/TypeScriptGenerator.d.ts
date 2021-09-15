import { Path, Schemas } from "firebase-bolt";
export default class TypeScriptGenerator {
    private schemas;
    private paths;
    private atomicTypes;
    constructor(schemas: Schemas, paths: Path[]);
    pathsToInterface(root: Record<string, any>): string;
    generate(): string;
    private serializeTypeName;
    private serialize;
    private serializeSimpleType;
    private serializeUnionType;
    private serializeGenericType;
    private serializeGenericTypeRef;
    private serializeRef;
    private derivesFromMap;
    private derivesFromAtomic;
    private derives;
    private isNullable;
    private serializeSchema;
}
