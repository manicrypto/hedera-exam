const {
    Client,
    AccountBalanceQuery,
    PrivateKey
} = require("@hashgraph/sdk");
require("dotenv").config({ path: ".env" });

async function main() {

    const myAccountId = process.env.SECOND_ACCOUNT_ID;
    const myPrivateKey = PrivateKey.fromString(process.env.SECOND_PRIVATE_KEY);

    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    // Create the query
    const query = new AccountBalanceQuery()
     .setAccountId(myAccountId);

    // Sign with the client operator account private key and submit to a Hedera network
    const accountBalance = await query.execute(client);

    if (accountBalance) {
        console.log(`The account balance for account ${myAccountId} is ${accountBalance.hbars} HBar`);

        console.log("All account Info:")
        console.log(JSON.stringify(accountBalance));
    }

    process.exit();
}

main();
