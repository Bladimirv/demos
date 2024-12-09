exports.handler = async (event) => {
    try {
        for (const record of event.Records) {
            console.log('SQS Record::', JSON.stringify(record));
        }
        // throw new Error('Error de prueba');
        return;
    } catch (err) {
        console.log("Error", err);
        throw err;
    }
};