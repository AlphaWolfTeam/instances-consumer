import IProperty from "./property.interface";

export default interface ISchema {
  _id?: string;
  schemaName: string;
  schemaProperties: IProperty[];
  createdAt?: Date;
  updatedAt?: Date;
}
