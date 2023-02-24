const {
  ScheduleSignTransaction,
  Client,
  PrivateKey,
  ScheduleInfoQuery,
  Timestamp, Transaction, ScheduleId, AccountId, TransactionId
} = require("@hashgraph/sdk");
require("dotenv").config({ path: ".env" });

const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);

const secondAccountId = process.env.SECOND_ACCOUNT_ID;
const secondPrivateKey = PrivateKey.fromString(process.env.SECOND_PRIVATE_KEY);

const scheduleId = process.env.SCHEDULE_ID;

const transactionId = process.env.Transaction_ID;

// If we weren't able to grab it, we should throw a new error
if (firstAccountId == null || firstPrivateKey == null) {
  throw new Error(
    "Environment variables myAccountId and myPrivateKey must be present"
  );
}

// Create our connection to the Hedera network
// The Hedera JS SDK makes this really easy!
const client = Client.forTestnet();

client.setOperator(firstAccountId, firstPrivateKey);

async function main() {
  //Create the query
  const query = new ScheduleInfoQuery().setScheduleId(scheduleId);

  //Sign with the client operator private key and submit the query request to a node in a Hedera network
  const info = await query.execute(client);
  console.log(
    "The scheduledId you queried for is: ",
    new ScheduleId(info.scheduleId).toString()
  );
  console.log("The Serialised memo is: ", info.scheduleMemo);

  console.log("The deserialised memois: ", atob(info.scheduleMemo));

  console.log(
    "It got created by: ",
    new AccountId(info.creatorAccountId).toString()
  );
  console.log(
    "It got payed by: ",
    new AccountId(info.payerAccountId).toString()
  );
  console.log(
    "The expiration time of the scheduled tx is: ",
    new Timestamp(info.expirationTime).toDate()
  );
  if (
    new Timestamp(info.executed).toDate().getTime() ===
    new Date("1970-01-01T00:00:00.000Z").getTime()
  ) {
    console.log("The transaction has not been executed yet.");
  } else {
    console.log(
      "The time of execution of the scheduled tx is: ",
      new Timestamp(info.executed).toDate()
    );
  }

  //Create the transaction
  const transaction = await new ScheduleSignTransaction()
    .setScheduleId(scheduleId)
    .setTransactionMemo(atob(info.scheduleMemo))
    // .setTransactionId(transactionId)
    .freezeWith(client)
    .sign(secondPrivateKey);

  //Sign with the client operator key to pay for the transaction and submit to a Hedera network
  const txResponse = await transaction.execute(client);

  //Get the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the transaction status
  const transactionStatus = receipt.status;
  console.log("The transaction consensus status is " + transactionStatus);

  process.exit();
}

main();
