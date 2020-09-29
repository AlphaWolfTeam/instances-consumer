import menash, { ConsumerMessage } from "menashmq";
import SchemaMessage from "./utils/schemaMessage.interface";

export default class Server {
    private uri: string = '';
    private consumer_queue: string = '';
    private producer_queue: string = ''; 

    public async initialize(config: {
        uri: string,
        consumer_queue: string,
        producer_queue: string,
    }) {
        this.uri = config.uri;
        this.consumer_queue = config.consumer_queue;
        this.producer_queue = config.producer_queue;

        console.log("Connecting to Rabbit...");
        await menash.connect(this.uri);
        console.log("Rabbit connected");
        await menash.declareTopology({
            queues: [
                { name: this.consumer_queue },
                { name: this.producer_queue }
            ]
        });
        console.log("Rabbit initialized");
        await menash.queue(this.consumer_queue)
            .activateConsumer(this.receiveDataFromRabbit);
        console.log("Rabbit consumer has been activated");
    }

    private async sendDataToRabbit(data: any) {
        return await menash.send(this.producer_queue, data);
    };

    private receiveDataFromRabbit(msg: ConsumerMessage) {
        const data = msg.getContent() as SchemaMessage;
        console.log(data);

        msg.ack();
    }
}