import menash, { ConsumerMessage } from "menashmq";
import SchemaMessage from "./utils/schemaMessage.interface";
import { InstanceRouter } from "./instance/instance.router";

export default class Server {
  private uri: string = "";
  private consumer_queue: string = "";

  public async initialize(config: { uri: string; consumer_queue: string }) {
    this.uri = config.uri;
    this.consumer_queue = config.consumer_queue;

    console.log("Connecting to Rabbit...");
    await menash.connect(this.uri);
    console.log("Rabbit connected");
    await menash.declareTopology({
      queues: [{ name: this.consumer_queue }],
    });
    console.log("Rabbit initialized");
    await menash
      .queue(this.consumer_queue)
      .activateConsumer(this.receiveDataFromRabbit);
    console.log("Rabbit consumer has been activated");
  }

  private async receiveDataFromRabbit(msg: ConsumerMessage) {
    const schemaMsg = msg.getContent() as SchemaMessage;
    console.log(schemaMsg);
    try {
      const crudMethodRes = await InstanceRouter.schemaMethodRouter(schemaMsg);
      console.log(crudMethodRes);
    } catch (e) {
      console.error(e);
    } finally {
      msg.ack();
    }
  }
}
