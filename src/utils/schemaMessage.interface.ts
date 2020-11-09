import ISchema from "./schema.interface";

export default interface SchemaMessage {
  method: string;
  schema?: ISchema;
  prevSchema?: ISchema;
  schemaName?: string;
  propertyName?: string;
}
