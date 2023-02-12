// Bring common classes into scope, and Fabric SDK network class
const {
  ROLE_ADMIN,
  getMessage,
  validateRole,
  createRedisForDoctor,
} = require("../utils/utils");
const network = require("../app/helper");

exports.createOrphan = async (req, res) => {
  // User role from the request header is validated
  let { role, username, org, args } = req.body;
  let { chaincodeName, channelName } = req.params;
  let isAuthorized = await validateRole([ROLE_ADMIN], role, res);
  if (!isAuthorized)
    return res.status(500).send({ message: "Unauthorized access" });

  // Set up and connect to Fabric Gateway using the username and org in header
  const networkObj = await network.connectToNetwork(
    username,
    org,
    channelName,
    chaincodeName,
    res
  );

  // get lastest orphan id from ledger
  let lastId = await network.invoke(
    networkObj,
    true,
    role + "Contract:getLatestOrphanId",
    JSON.stringify(args),
    res
  );
  lastId = JSON.parse(lastId.toString());
  lastId = parseInt(lastId.id.slice(3)) + 1;

  const userIdToAdd = "ORP" + lastId;
  args.orphanId = userIdToAdd;
  console.log(userIdToAdd);

  // invoke create orphan function in admin contract
  try {
    console.log("Registering user with userid " + args.orphanId + " in ledger");
    let result = await network.invoke(
      networkObj,
      false,
      role + "Contract:createOrphan",
      JSON.stringify(args),
      res
    );
    console.log("Successfully registered user in ledger");
    console.log("Result is : ");
    console.log(JSON.parse(result.toString()));
  } catch (error) {
    console.log("\nSome error occured in Contract:CreateOrphan\n");
    console.log(error);
    res
      .status(400)
      .send({ message: "Some error occurred while creating orphan" });
  }

  // Enroll and register the user with the CA and adds the user to the wallet.
  try {
    console.log("Registering user in wallet with userId " + args.orphanId);
    await network.registerUser(org, userIdToAdd);
    res
      .status(200)
      .send(getMessage(false, "Successfully registered Orphan.", userIdToAdd));
  } catch (error) {
    console.log("\nSome error occured in Contract:DeleteOrphan\n");
    console.log(error);
    res.status(500).send({ error });
  }
};

exports.updateOrphan = async (req, res) => {
  // User role from the request header is validated
  let { role, username, org, args } = req.body;
  let { chaincodeName, channelName } = req.params;
  let isAuthorized = await validateRole([ROLE_ADMIN], role, res);
  if (!isAuthorized)
    return res.status(500).send({ message: "Unauthorized access" });

  // Set up and connect to Fabric Gateway using the username and org in header
  const networkObj = await network.connectToNetwork(
    username,
    org,
    channelName,
    chaincodeName,
    res
  );

  args.orphanId = req.body.orphanId;

  // invoke create orphan function in admin contract
  try {
    console.log(
      "Updating orphan with orphanId " + args.orphanId + " in ledger"
    );
    let result = await network.invoke(
      networkObj,
      false,
      role + "Contract:updateOrphan",
      JSON.stringify(args),
      res
    );
    console.log("Successfully updated user in ledger");
    console.log("Result is : ");
    console.log(JSON.parse(result.toString()));
    res
      .status(200)
      .send(getMessage(false, "Successfully Updated Orphan.", args.orphanId));
  } catch (error) {
    console.log("\nSome error occured in Contract:UpdateOrphan\n");
    console.log(error);
    res
      .status(400)
      .send({ message: "Some error occurred while updating orphan" });
  }
};

exports.readOrphan = async (req, res) => {
  // User role from the request header is validated
  let { role, username, org, args } = req.body;
  let { chaincodeName, channelName } = req.params;

  let isAuthorized = await validateRole([ROLE_ADMIN], role, res);
  if (!isAuthorized)
    return res.status(500).send({ message: "Unauthorized access" });

  // Set up and connect to Fabric Gateway using the username and org in header
  const networkObj = await network.connectToNetwork(
    username,
    org,
    channelName,
    chaincodeName,
    res
  );

  try {
    let result = await network.invoke(
      networkObj,
      true,
      role + "Contract:readOrphan",
      JSON.stringify(args),
      res
    );
    if (result.statusCode != 500) {
      console.log("Result is : ");
      console.log(JSON.parse(result.toString()));
      res.status(200).send({
        result: JSON.parse(result.toString()),
      });
    }

    return;
  } catch (error) {
    console.log("Some error occurred in admin read orphan");
    console.log(error);
    res.send(registerUserRes.error);
  }
};

exports.queryAllOrphan = async (req, res) => {
  // User role from the request header is validated
  let { role, username, org } = req.body;
  let { chaincodeName, channelName } = req.params;
  let isAuthorized = await validateRole([ROLE_ADMIN], role, res);
  if (!isAuthorized)
    return res.status(500).send({ message: "Unauthorized access" });
  // Set up and connect to Fabric Gateway using the username and org in header
  // let args = req.body.args;
  const networkObj = await network.connectToNetwork(
    username,
    org,
    channelName,
    chaincodeName,
    res
  );

  // get lastest orphan id from ledger
  try {
    let result = await network.invoke(
      networkObj,
      true,
      role + "Contract:queryAllOrphan",
      JSON.stringify({}),
      res
    );
    console.log("Result is : ");
    console.log(JSON.parse(result.toString()));
    res.status(200).send({
      result: JSON.parse(result.toString()),
    });
    return;
  } catch (error) {
    console.log("Some error occurred in admin read orphan");
    console.log(error);
    res.send(error);
  }
};

// exports.grantAccessToDoctor = async (req, res) => {
//   // User role from the request header is validated
//   let { role, username, org, args } = req.body;

//   await validateRole([ROLE_ADMIN], role, res);

//   // Set up and connect to Fabric Gateway using the username and org in header
//   const networkObj = await network.connectToNetwork(username, org, res);

//   try {
//     let result = await network.invoke(
//       networkObj,
//       false,
//       role + "Contract:grantAccessToDoctor",
//       JSON.stringify(args),
//       res
//     );
//     console.log("Result is : ");
//     console.log(JSON.parse(result.toString()));
//     res.status(200).send({
//       result: JSON.parse(result.toString()),
//     });
//     return;
//   } catch (error) {
//     console.log("Some error occurred in admin grant doctor access orphan");
//     console.log(error);
//     res.send(error);
//   }
// };

// exports.revokeAccessFromDoctor = async (req, res) => {
//   // User role from the request header is validated
//   let { role, username, org, args } = req.body;

//   await validateRole([ROLE_ADMIN], role, res);

//   // Set up and connect to Fabric Gateway using the username and org in header
//   const networkObj = await network.connectToNetwork(username, org, res);

//   try {
//     let result = await network.invoke(
//       networkObj,
//       false,
//       role + "Contract:revokeAccessFromDoctor",
//       JSON.stringify(args),
//       res
//     );
//     console.log("Result is : ");
//     console.log(JSON.parse(result.toString()));
//     res.status(200).send({
//       result: JSON.parse(result.toString()),
//     });
//     return;
//   } catch (error) {
//     console.log("Some error occurred in admin revoke doctor access orphan");
//     console.log(error);
//     res.send(error);
//   }
// };

// exports.createDoctor = async (req, res) => {
//   // User role from the request header is validated
//   let { role, username, org, args } = req.body;
//   let doctorId = org + "-" + "DOC" + args.doctorNumber;

//   await validateRole([ROLE_ADMIN], role, res);

//   // Create a redis client and add the doctor to redis
//   // await createRedisForDoctor(args.org, args.doctorNumber);

//   // Enroll and register the user with the CA and adds the user to the wallet.
//   let attributes = {
//     firstName: args.firstName,
//     lastName: args.lastName,
//     speciality:args.speciality,
//     role: "doctor"
//   };
//   const response = await network.registerUser(org, doctorId, JSON.stringify(attributes));

//   // Delete the user from redis if the failed to register user in wallet
//   // if (response.error) {
//   //   (await redisClient).DEL(doctorId);
//   //   res.status(400).send(response.error);
//   // }

//   console.log("Doctor successfully registered");
//   res.status(201).send({
//     username: doctorId,
//     message: "Doctor successfully registered",
//   });
// };

// exports.getDoctorsByOrgId = async (req, res) => {

//   let { role, username, org } = req.body;
//   let doctorCount = 0;
//   await validateRole([ROLE_ADMIN], role, res);
//   // Set up and connect to Fabric Gateway
//   const networkObj = await network.connectToNetwork(username, org, res);
//   // Use the gateway and identity service to get all users enrolled by the CA
//   const response = await network.getAllDoctorsByOrgId(networkObj, org);
//   (response.error) ? res.status(500).send(response.error) : res.status(200).send(response);
// };
