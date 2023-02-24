const {
  TransferTransaction,
  Client,
  ScheduleCreateTransaction,
  PrivateKey,
  Hbar,
  ScheduleInfoQuery,
} = require("@hashgraph/sdk");
require("dotenv").config({ path: ".env" });

const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);

// const myAccountId = process.env.MY_ACCOUNT_ID;
// const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

// const myAccountId = firstAccountId;
// const myPrivateKey = firstPrivateKey;

const secondAccountId = process.env.SECOND_ACCOUNT_ID;
const secondPrivateKey = PrivateKey.fromString(process.env.SECOND_PRIVATE_KEY);

// If we weren't able to grab it, we should throw a new error
// if (myAccountId == null || myPrivateKey == null) {
//   throw new Error(
//     "Environment variables myAccountId and myPrivateKey must be present"
//   );
// }

// If we weren't able to grab it, we should throw a new error
if (firstAccountId == null || firstPrivateKey == null) {
  throw new Error(
    "Environment variables firstAccountId and firstPrivateKey must be present"
  );
}

// Create our connection to the Hedera network
// The Hedera JS SDK makes this really easy!
const client = Client.forTestnet();

client.setOperator(firstAccountId, firstPrivateKey);

async function main() {
  //Create a transaction to schedule
  const transaction = new TransferTransaction()
    .addHbarTransfer(firstAccountId, Hbar.fromTinybars(-10))
    .addHbarTransfer(secondAccountId, Hbar.fromTinybars(10));

  var encodedString = btoa('Serialise and scheduled this 10 Hbar transaction!');

  //Schedule a transaction
  const scheduleTransaction = await new ScheduleCreateTransaction()
    .setScheduledTransaction(transaction)
    .setScheduleMemo(encodedString)
    .setAdminKey(firstPrivateKey)
    .execute(client);

  //Get the receipt of the transaction
  const receipt = await scheduleTransaction.getReceipt(client);

  //Get the schedule ID
  const scheduleId = receipt.scheduleId;
  console.log("The schedule ID is " + scheduleId);

  //Get the scheduled transaction ID
  const scheduledTxId = receipt.scheduledTransactionId;
  console.log("The scheduled transaction ID is " + scheduledTxId);

  process.exit();
}

main();
