import mongodb from "mongodb";
import ISchema from "./schema.interface";
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

  public static async createCollection(schema: ISchema) {
    return await this.dbClient
      .db(this.dbName)
      .createCollection(schema.schemaName);
  }

  public static async handleSchemaCreation(schema: ISchema) {
    const collection = await this.createCollection(schema);
    const indexAndUniqueProps = schema.schemaProperties.filter(
      (prop) => prop.isUnique || prop.index
    );
    
    await Promise.all(
      indexAndUniqueProps.map(
        async (prop) => await collection.createIndex(prop.propertyName)
      )
    );
  }
}
