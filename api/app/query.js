const { Gateway, Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");
const log4js = require("log4js");
const logger = log4js.getLogger("BasicNetwork");
const {
  buildCCPOrg1,
  buildCCPOrg2,
  buildWallet,
  buildAffliation,
} = require("./AppUtils");
const util = require("util");

const helper = require("./helper");
const query = async (
  channelName,
  chaincodeName,
  fcn,
  args,
  username,
  org_name,
  userIdentity
) => {
  try {
    let ccp, walletPath;
    if (org_name == "Org1") {
      ccp = buildCCPOrg1();
      walletPath = path.resolve(__dirname, "..", "org1-wallet");
    } else if (org_name == "Org2") {
      ccp = buildCCPOrg2();
      walletPath = path.resolve(__dirname, "..", "org2-wallet");
    }
    // load the network configuration
    // const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org1.json');
    // const ccpJSON = fs.readFileSync(ccpPath, 'utf8')

    // Create a new file system based wallet for managing identities.
    const wallet = await buildWallet(Wallets, walletPath);

    // Check to see if we've already enrolled the user.
    let identity = await wallet.get(username);
    if (!identity) {
      console.log(
        `An identity for the user ${username} does not exist in the wallet, so registering user`
      );
      // await helper.getRegisteredUser(username, org_name, true)
      // identity = await wallet.get(username);
      // console.log('Run the registerUser.js application before retrying');
      return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: username,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(chaincodeName);
    let result;
    args.id = username;
    result = await contract.evaluateTransaction(
      userIdentity+"Contract:"+fcn,
      JSON.stringify(args)
    );

    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );

    result = JSON.parse(result.toString());
    return result;
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    return error.message;
  }
};

exports.query = query;
