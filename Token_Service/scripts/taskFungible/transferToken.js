const {
  TransferTransaction,
  Client,
  TokenAssociateTransaction,
  Wallet,
  PrivateKey,
} = require("@hashgraph/sdk");
require("dotenv").config({ path: ".env" });

const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);

const thirdAccountId = process.env.THIRD_ACCOUNT_ID;
const thirdPrivateKey = PrivateKey.fromString(process.env.THIRD_PRIVATE_KEY);

const fourthAccountId = process.env.FOURTH_ACCOUNT_ID;
const fourthPrivateKey = PrivateKey.fromString(process.env.FOURTH_PRIVATE_KEY);

const tokenId = process.env.TOKEN_ID;

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

const wallet = new Wallet(thirdAccountId, thirdPrivateKey);

// const wallet = new Wallet(
//     fourthAccountId,
//     fourthPrivateKey
// );

async function main() {
  //  Before an account that is not the treasury for a token can receive or send this specific token ID, the account
  //  must become “associated” with the token.
  let associateOtherWalletTx = await new TokenAssociateTransaction()
    .setAccountId(wallet.accountId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(thirdPrivateKey);

  //SUBMIT THE TRANSACTION
  let associateOtherWalletTxSubmit = await associateOtherWalletTx.execute(
    client
  );

  //GET THE RECEIPT OF THE TRANSACTION
  let associateOtherWalletRx = await associateOtherWalletTxSubmit.getReceipt(
    client
  );

  //LOG THE TRANSACTION STATUS
  console.log(
    `- Token association with the users account: ${associateOtherWalletRx.status} \n`
  );

  //Create the transfer transaction
  const transaction = await new TransferTransaction()
    .addTokenTransfer(tokenId, client.operatorAccountId, -1.35)
    .addTokenTransfer(tokenId, wallet.accountId, 1.35)
    .freezeWith(client);

  //Sign with the sender account private key
  const signTx = await transaction.sign(firstPrivateKey);

  //Sign with the client operator private key and submit to a Hedera network
  const txResponse = await signTx.execute(client);

  //Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Obtain the transaction consensus status
  const transactionStatus = receipt.status;

  console.log(
    "The transaction consensus status " + transactionStatus.toString()
  );

  process.exit();
}

main();
