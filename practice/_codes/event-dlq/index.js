const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const sqs = new AWS.SQS();

exports.handler = async () => {
    const queueUrl = process.env.SQS_DLQ_QUEUE_URL;
    try {
        const params = {
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 3,
            VisibilityTimeout: 30,
            WaitTimeSeconds: 0,
        };
        const result = await sqs.receiveMessage(params).promise();

        if (!result.Messages || result.Messages.length === 0) {
            console.log('No hay mensajes en la DLQ.');
            return;
        }

        for (const message of result.Messages) {
            console.log('Mensaje recibido:', JSON.stringify(message));
            const deleteParams = {
                QueueUrl: queueUrl,
                ReceiptHandle: message.ReceiptHandle,
            };
            await sqs.deleteMessage(deleteParams).promise();
            console.log(`Mensaje con ID ${message.MessageId} eliminado de la cola.`);
        }
    } catch (err) {
        console.error('Error al leer mensajes de la DLQ:', err);
        throw err;
    }
};
