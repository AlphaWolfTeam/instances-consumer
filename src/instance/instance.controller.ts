import { InstanceManager } from "./instance.manager";
import SchemaMessage from "../utils/schemaMessage.interface";
import { ValidationError } from "../utils/errors/user";

export class InstanceController {
  public static async createCollection(schemaMsg: SchemaMessage) {
    if (schemaMsg.schema) {
      return InstanceManager.createCollection(schemaMsg.schema);
    } else {
      throw new ValidationError();
    }
  }
  public static async updateCollection(schemaMsg: SchemaMessage) {
    if (schemaMsg.schema && schemaMsg.prevSchema) {
      return InstanceManager.updateCollection(
        schemaMsg.prevSchema,
        schemaMsg.schema
      );
    } else {
      throw new ValidationError();
    }
  }
  public static async deleteCollection(schemaMsg: SchemaMessage) {
    if (schemaMsg.schemaName) {
      return InstanceManager.deleteCollection(schemaMsg.schemaName);
    } else {
      throw new ValidationError();
    }
  }
  public static async deleteProperty(schemaMsg: SchemaMessage) {
    if (schemaMsg.schemaName && schemaMsg.propertyName) {
      return InstanceManager.deleteProperty(
        schemaMsg.schemaName,
        schemaMsg.propertyName
      );
    } else {
      throw new ValidationError();
    }
  }
}
