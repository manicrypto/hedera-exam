const {
    PrivateKey,
    TopicMessageSubmitTransaction,
    Client
} = require("@hashgraph/sdk");
require('dotenv').config({ path: '.env' });

const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);
const topicId = process.env.TOPIC_ID;

// If we weren't able to grab it, we should throw a new error
if (firstAccountId == null ||
    firstPrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

const client = Client.forTestnet();

client.setOperator(firstAccountId, firstPrivateKey);

async function main() {
    // Send one message
    let sendResponse = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: "Current time : " + new Date().toISOString(),
    }).execute(client);

    //Get the receipt of the transaction
    const getReceipt = await sendResponse.getReceipt(client);

    //Get the status of the transaction
    const transactionStatus = getReceipt.status;
    console.log("The message transaction status: " + transactionStatus);

    process.exit();
}

main();
