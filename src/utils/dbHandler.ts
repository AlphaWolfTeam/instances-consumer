import mongodb from "mongodb";
import ISchema from './schema.interface';
import IProperty from "./property.interface";

export class DBHandler {
  public static dbClient: mongodb.MongoClient;
  public static dbName: string;

  public static async connect(dbUri: string) {
    this.dbClient = await mongodb.connect(dbUri, { useUnifiedTopology: true });
    this.dbName = dbUri.split("/")[dbUri.split("/").length - 1];
  }

  public static async disconnect() {
    await this.dbClient.close();
  }

  public static async createCollection(collectionName: string, msg: ISchema) {
    const validator = this.msgToValidatorParser(msg);
    this.dbClient.db(this.dbName).collection(collectionName)
    return await this.dbClient.db(this.dbName)
      .createCollection(collectionName, {
        validator,
        validationAction: "error",
      });
  }

  private static msgToValidatorParser(msg: ISchema): {} {
    const properties = Object.fromEntries(
      msg.schemaProperties.map((prop: IProperty) => 
      [prop.propertyName, {
        bsonType: prop.propertyType,
        unique: prop.isUnique,
        enum?: prop.enum
      }]
      ));
    const validator = {
      $jsonSchema: {
        bsonType: "object",
        required: msg.schemaProperties
          .filter((prop: IProperty) => !!prop.required)
          .map((prop: IProperty) => prop.propertyName),
        properties: {

        } 
      },
    }
    return {};
  }
}
