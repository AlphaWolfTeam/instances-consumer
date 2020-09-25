import menash from "menashmq";
import { config } from "../../config";
import IRabbitMessage from "./rabbitMessage.interface";

const { rabbit } = config;

export const initRabbit = async () => {
  console.log("Connecting to Rabbit...");
  await menash.connect(rabbit.uri, rabbit.retryOptions);
  console.log("Rabbit connected");
  await menash.declareQueue(rabbit.queueName);
  console.log("Rabbit initialized");
};

export const sendDataToRabbit = async (data: IRabbitMessage) => {
  return menash.send(rabbit.queueName, data);
};

// export const receiveDataFromRabbit = (msg: ConsumerMessage) => {
//     const data = msg.getContent();
//     console.log(data);
//     msg.ack();
// }

// const main = async() => {
//     await initRabbit();
//     await menash.queue('instances-queue').activateConsumer(receiveDataFromRabbit: ConsumerMessage);
// }

// const main = async() => {
//     await initRabbit();
// }
