const {
  Client,
  PrivateKey,
  Wallet,
  TokenUnpauseTransaction
} = require("@hashgraph/sdk");
require("dotenv").config({ path: ".env" });

const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);

const thirdAccountId = process.env.THIRD_ACCOUNT_ID;
const thirdPrivateKey = PrivateKey.fromString(process.env.THIRD_PRIVATE_KEY);

const tokenId = process.env.TOKEN_ID;
const adminUser = new Wallet(firstAccountId, firstPrivateKey);

async function main() {
  if (firstAccountId == null || firstPrivateKey == null) {
    throw new Error(
      "Environment variables firstAccountId and firstPrivateKey must be present"
    );
  }


  if (thirdAccountId == null || thirdPrivateKey == null) {
    throw new Error(
      "Environment variables thirdAccountId and thirdPrivateKey must be present"
    );
  }

  // Create our connection to the Hedera network
  // The Hedera JS SDK makes this really easy!
  const client = Client.forTestnet();

  client.setOperator(firstAccountId, firstPrivateKey);
  //Create the token pause transaction, specify the token to pause, freeze the unsigned transaction for signing
  const transaction = new TokenUnpauseTransaction()
    .setTokenId(tokenId)
    .freezeWith(client);

  //Sign with the pause key
  const signTx = await transaction.sign(firstPrivateKey);

  //Submit the transaction to a Hedera network
  const txResponse = await signTx.execute(client);

  //Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the transaction consensus status
  const transactionStatus = receipt.status;

  console.log(
    "The transaction consensus status " + transactionStatus.toString()
  );

  process.exit();
}

main();
