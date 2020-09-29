import ISchema from "./schema.interface";

export default interface SchemaMessage {
    method: string;
    schema?: ISchema;
    propertyName?: string;
    schemaName?: string;
    prevSchemaName?: string;
}