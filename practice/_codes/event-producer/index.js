const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const sqs = new AWS.SQS();

const params = {
    MessageAttributes: {
        Title: {
            DataType: "String",
            StringValue: "Mensaje de prueba",
        },
    },
    MessageBody: "Este es el contenido de un mensaje de prueba.",
    QueueUrl: process.env.SQS_QUEUE_URL,
};
exports.handler = async () => {
    try {
        console.log('Enviando mensaje', JSON.stringify(params));
        const data = await sqs.sendMessage(params).promise();
        console.log("Success", data.MessageId);
        return
    } catch (err) {
        console.log("Error", err);
        throw err;
    }
};