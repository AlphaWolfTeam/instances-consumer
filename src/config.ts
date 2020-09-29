export const config = {
    rabbit: {
        uri: process.env.RABBIT_URI || '',
        consumer_queue: process.env.CONSUMER_QUEUE_NAME || 'instancesConsumerQueue',
        producer_queue: process.env.PRODUCER_QUEUE_NAME || 'instancesProducerQueue',
    },
};
