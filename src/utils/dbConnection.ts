import mongodb from "mongodb";

export class DBConnection {
  public static dbClient: mongodb.MongoClient;
  public static dbName: string;

  public static async connect(dbUri: string) {
    this.dbClient = await mongodb.connect(dbUri, { useUnifiedTopology: true });
    this.dbName = dbUri.split("/")[dbUri.split("/").length - 1];
  }

  public static async disconnect() {
    await this.dbClient.close();
  }
}
