import { DBConnection } from "./utils/dbConnection";
import { config } from "./config";
import Server from "./server";

process.on("uncaughtException", console.error);

async () => {
  try {
    await DBConnection.connect(config.mongo.uri);
    const server = new Server().initialize(config.rabbit);
  } catch (error) {
    console.error(error);
  }
};
