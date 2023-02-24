const {
    TopicCreateTransaction,
    Client,
    PrivateKey
} = require("@hashgraph/sdk");
require('dotenv').config({ path: '.env' });

const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);

// If we weren't able to grab it, we should throw a new error
if (firstAccountId == null ||
    firstPrivateKey == null ) {
    throw new Error("Environment variables firstAccountId and firstPrivateKey must be present");
}

const client = Client.forTestnet();

client.setOperator(firstAccountId, firstPrivateKey);

async function main() {
    //Create a new topic
    let txResponse = await new TopicCreateTransaction().execute(client);

    //Get the receipt of the transaction
    let receipt = await txResponse.getReceipt(client);

    //Grab the new topic ID from the receipt
    let topicId = receipt.topicId;

    //Log the topic ID
    console.log(`Your topic ID is: ${topicId}`);

    // Wait 5 seconds between consensus topic creation and subscription
    await new Promise((resolve) => setTimeout(resolve, 5000));

    process.exit();
}

main();
