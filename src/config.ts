export const config = {
  rabbit: {
    uri: process.env.RABBIT_URI || "amqp://localhost:5672",
    consumer_queue: process.env.CONSUMER_QUEUE_NAME || "instancesConsumerQueue",
  },
  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/instances",
  },
};
