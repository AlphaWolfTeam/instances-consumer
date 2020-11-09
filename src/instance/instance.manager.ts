import ISchema from "../utils/schema.interface";
import { InstanceRepository } from "./instance.repository";

export class InstanceManager {
  public static async createCollection(schema: ISchema) {
    return InstanceRepository.createCollection(schema);
  }
  public static async updateCollection(
    prevSchema: ISchema,
    newSchema: ISchema
  ) {
    return InstanceRepository.updateCollection(prevSchema, newSchema);
  }
  public static async deleteCollection(schemaName: string) {
    return InstanceRepository.deleteCollection(schemaName);
  }
  public static async deleteProperty(schemaName: string, propertyName: string) {
    return InstanceRepository.deleteProperty(schemaName, propertyName);
  }
}
