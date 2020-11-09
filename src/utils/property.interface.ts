export default interface IProperty {
  _id?: string;
  propertyName: string;
  propertyType: string;
  defaultValue?: any;
  propertyRef?: string;
  enum?: any[];
  isUnique: boolean;
  index?: boolean;
  required?: boolean;
  validation?: Object;
  createdAt?: Date;
  updatedAt?: Date;
}
