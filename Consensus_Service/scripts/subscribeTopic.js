const {
    TopicMessageQuery,
    Client,
    PrivateKey
} = require("@hashgraph/sdk");
require('dotenv').config({ path: 'Consensus_Service/.env' });

const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);
const topicId = process.env.TOPIC_ID;

// If we weren't able to grab it, we should throw a new error
if (firstAccountId == null ||
    firstPrivateKey == null ) {
    throw new Error("Environment variables firstAccountId and firstPrivateKey must be present");
}

const client = Client.forTestnet();

client.setOperator(firstAccountId, firstPrivateKey);

async function main() {
    //Create the query to subscribe to a topic
    new TopicMessageQuery()
        .setTopicId(topicId)
        .setStartTime(0)
        .subscribe(
            client,
            (message) => console.log(Buffer.from(message.contents, "utf8").toString())
        );
}

main();
