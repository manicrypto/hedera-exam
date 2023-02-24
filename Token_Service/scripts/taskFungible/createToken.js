const {
  TokenCreateTransaction,
  Client,
  TokenType,
  TokenInfoQuery,
  AccountBalanceQuery,
  PrivateKey,
  Wallet,
  TokenSupplyType
} = require("@hashgraph/sdk");
require("dotenv").config({ path: ".env" });

const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);

const secondAccountId = process.env.SECOND_ACCOUNT_ID;
const secondPrivateKey = PrivateKey.fromString(process.env.SECOND_PRIVATE_KEY);

if (firstAccountId == null || firstPrivateKey == null) {
  throw new Error(
    "Environment variables firstAccountId and firstAccountId must be present"
  );
}

if (secondAccountId == null || secondPrivateKey == null) {
  throw new Error(
    "Environment variables secondAccountId and secondPrivateKey must be present"
  );
}

// Create our connection to the Hedera network
// The Hedera JS SDK makes this really easy!
const client = Client.forTestnet();

client.setOperator(firstAccountId, firstPrivateKey);

const adminUser = new Wallet(firstAccountId, firstPrivateKey);

const supplyUser = new Wallet(secondAccountId, secondPrivateKey);

async function main() {
  //Create the transaction and freeze for manual signing
  const transaction = await new TokenCreateTransaction()
    .setTokenName("Megachain Game Token")
    .setTokenSymbol("MGT")
    .setTokenType(TokenType.FungibleCommon)
    .setTreasuryAccountId(firstAccountId)
    .setInitialSupply(350.5) //Inital suppy 350
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(500)
    .setPauseKey(firstPrivateKey)
    .setAdminKey(adminUser.publicKey)
    .setSupplyKey(supplyUser.publicKey)
    .freezeWith(client);

  //Sign the transaction with the client, who is set as admin and treasury account
  const signTx = await transaction.sign(firstPrivateKey);

  //Submit to a Hedera network
  const txResponse = await signTx.execute(client);

  //Get the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the token ID from the receipt
  const tokenId = receipt.tokenId;

  console.log("The new token ID is " + tokenId);

  //Sign with the client operator private key, submit the query to the network and get the token supply

  const name = await queryTokenFunction("name", tokenId);
  const symbol = await queryTokenFunction("symbol", tokenId);
  const tokenSupply = await queryTokenFunction("totalSupply", tokenId);
  console.log(
    "The total supply of the " +
      name +
      " token is " +
      tokenSupply +
      " of " +
      symbol
  );

  //Create the query
  const balanceQuery = new AccountBalanceQuery().setAccountId(
    adminUser.accountId
  );

  //Sign with the client operator private key and submit to a Hedera network
  const tokenBalance = await balanceQuery.execute(client);

  console.log(
    "The balance of the user is: " + tokenBalance.tokens.get(tokenId)
  );

  process.exit();
}

async function queryTokenFunction(functionName, tokenId) {
  //Create the query
  const query = new TokenInfoQuery().setTokenId(tokenId);

  console.log("retrieveing the " + functionName);
  const body = await query.execute(client);

  //Sign with the client operator private key, submit the query to the network and get the token supply
  let result;
  if (functionName === "name") {
    result = body.name;
  } else if (functionName === "symbol") {
    result = body.symbol;
  } else if (functionName === "totalSupply") {
    result = body.totalSupply;
  } else {
    return;
  }

  return result;
}

main();
