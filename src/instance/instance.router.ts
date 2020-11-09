import SchemaMessage from "../utils/schemaMessage.interface";
import { NotFoundError } from "../utils/errors/user";
import { InstanceController } from "./instance.controller";

export class InstanceRouter {
  public static async schemaMethodRouter(schemaMsg: SchemaMessage) {
    switch (schemaMsg.method) {
      case "create schema":
        return InstanceController.createCollection(schemaMsg);
      case "update schema":
        return InstanceController.updateCollection(schemaMsg);
      case "delete schema":
        return InstanceController.deleteCollection(schemaMsg);
      case "delete property":
        return InstanceController.deleteProperty(schemaMsg);
      default:
        throw new NotFoundError();
    }
  }
}
