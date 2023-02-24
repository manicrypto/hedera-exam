const {
  Client,
  AccountCreateTransaction,
  PrivateKey,
  Hbar,
} = require("@hashgraph/sdk");

require("dotenv").config({ path: ".env" });

async function main() {

  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
  
  const client = Client.forTestnet();

  client.setOperator(myAccountId, myPrivateKey);

  const privateKey = await PrivateKey.generateED25519Async();
  const publicKey = privateKey.publicKey;

  console.log("private = " + privateKey);
  console.log("public = " + publicKey);

  const transaction = new AccountCreateTransaction()
    .setKey(privateKey.publicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .freezeWith(client);

  //Sign the transaction with the client operator private key and submit to a Hedera network
  const txResponse = await transaction.execute(client);

  //Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the account ID
  const newAccountId = receipt.accountId;

  console.log("The new account ID is " + newAccountId);
  process.exit();
}

main();
