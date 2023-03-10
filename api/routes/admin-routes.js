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
  await validateRole([ROLE_ADMIN], role, res);

  // Set up and connect to Fabric Gateway using the username and org in header
  const networkObj = await network.connectToNetwork(username, org, res);

  // get lastest orphan id from ledger
  let lastId = await network.invoke(
    networkObj,
    true,
    role + "Contract:GetLatestOrphanId",
    JSON.stringify(args),
    res
  );
  lastId = JSON.parse(lastId.toString());
  lastId = parseInt(lastId.ID.slice(3)) + 1;

  const userIdToAdd = "ORP" + lastId;
  args.id = userIdToAdd;

  // invoke create orphan function in admin contract
  try {
    console.log("Registering user with userid " + args.id + " in ledger");
    let result = await network.invoke(
      networkObj,
      false,
      role + "Contract:CreateOrphan",
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
    let attributes = {
      firstName: args.firstName,
      lastName: args.lastName,
      role: "orphan"
    };
    console.log("Registering user in wallet with userId " + args.id);
    await network.registerUser(org, userIdToAdd, JSON.stringify(attributes));
    res
      .status(201)
      .send(getMessage(false, "Successfully registered Orphan.", userIdToAdd));
  } catch (error) {
    console.log("\nSome error occured in Contract:DeleteOrphan\n");
    console.log(error);
    console.log("Deleting user from ledger failed to store user in wallet");
    args.userId = userIdToAdd;
    await network.invoke(
      networkObj,
      false,
      role + "Contract:DeleteOrphan",
      JSON.stringify(args),
      res
    );
    res.send(registerUserRes.error);
  }
};

exports.updateOrphan = async (req, res) => {
  // User role from the request header is validated
  let { role, username, org, args } = req.body;
  await validateRole([ROLE_ADMIN], role, res);

  // Set up and connect to Fabric Gateway using the username and org in header
  const networkObj = await network.connectToNetwork(username, org, res);

  let userIdToAdd = req.body.userId;
  args.id = userIdToAdd;

  // invoke create orphan function in admin contract
  try {
    console.log("Updating user with userid " + args.id + " in ledger");
    let result = await network.invoke(
      networkObj,
      false,
      role + "Contract:UpdateOrphan",
      JSON.stringify(args),
      res
    );
    console.log("Successfully updated user in ledger");
    console.log("Result is : ");
    console.log(JSON.parse(result.toString()));
    res
      .status(201)
      .send(getMessage(false, "Successfully Updated Orphan.", userIdToAdd));
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

  await validateRole([ROLE_ADMIN], role, res);

  // Set up and connect to Fabric Gateway using the username and org in header
  const networkObj = await network.connectToNetwork(username, org, res);

  try {
    let result = await network.invoke(
      networkObj,
      true,
      role + "Contract:ReadOrphan",
      JSON.stringify(args),
      res
    );
    console.log("Result is : ");
    console.log(JSON.parse(result.toString()));
    res.status(201).send({
      result: JSON.parse(result.toString()),
    });
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
  await validateRole([ROLE_ADMIN], role, res);

  // Set up and connect to Fabric Gateway using the username and org in header
  // let args = req.body.args;
  const networkObj = await network.connectToNetwork(username, org, res);

  // get lastest orphan id from ledger
  try {
    let result = await network.invoke(
      networkObj,
      true,
      role + "Contract:QueryAllOrphan",
      JSON.stringify({}),
      res
    );
    console.log("Result is : ");
    console.log(JSON.parse(result.toString()));
    res.status(201).send({
      result: JSON.parse(result.toString()),
    });
    return;
  } catch (error) {
    console.log("Some error occurred in admin read orphan");
    console.log(error);
    res.send(error);
  }
};

exports.deleteOrphan = async (req, res) => {
  // User role from the request header is validated
  let { role, username, org, args } = req.body;

  await validateRole([ROLE_ADMIN], role, res);

  // Set up and connect to Fabric Gateway using the username and org in header
  const networkObj = await network.connectToNetwork(username, org, res);

  try {
    let result = await network.invoke(
      networkObj,
      false,
      role + "Contract:DeleteOrphan",
      JSON.stringify(args),
      res
    );
    console.log("Result is : ");
    console.log(JSON.parse(result.toString()));
    res.status(201).send({
      result: JSON.parse(result.toString()),
    });
    return;
  } catch (error) {
    console.log("Some error occurred in admin read orphan");
    console.log(error);
    res.send(registerUserRes.error);
  }
};

exports.grantAccessToDoctor = async (req, res) => {
  // User role from the request header is validated
  let { role, username, org, args } = req.body;

  await validateRole([ROLE_ADMIN], role, res);

  // Set up and connect to Fabric Gateway using the username and org in header
  const networkObj = await network.connectToNetwork(username, org, res);

  try {
    let result = await network.invoke(
      networkObj,
      false,
      role + "Contract:GrantAccessToDoctor",
      JSON.stringify(args),
      res
    );
    console.log("Result is : ");
    console.log(JSON.parse(result.toString()));
    res.status(201).send({
      result: JSON.parse(result.toString()),
    });
    return;
  } catch (error) {
    console.log("Some error occurred in admin grant doctor access orphan");
    console.log(error);
    res.send(error);
  }
};

exports.revokeAccessFromDoctor = async (req, res) => {
  // User role from the request header is validated
  let { role, username, org, args } = req.body;

  await validateRole([ROLE_ADMIN], role, res);

  // Set up and connect to Fabric Gateway using the username and org in header
  const networkObj = await network.connectToNetwork(username, org, res);

  try {
    let result = await network.invoke(
      networkObj,
      false,
      role + "Contract:RevokeAccessFromDoctor",
      JSON.stringify(args),
      res
    );
    console.log("Result is : ");
    console.log(JSON.parse(result.toString()));
    res.status(201).send({
      result: JSON.parse(result.toString()),
    });
    return;
  } catch (error) {
    console.log("Some error occurred in admin revoke doctor access orphan");
    console.log(error);
    res.send(error);
  }
};

exports.createDoctor = async (req, res) => {
  // User role from the request header is validated
  let { role, username, org, args } = req.body;
  let doctorId = org + "-" + "DOC" + args.doctorNumber;

  await validateRole([ROLE_ADMIN], role, res);

  // Create a redis client and add the doctor to redis
  // await createRedisForDoctor(args.org, args.doctorNumber);

  // Enroll and register the user with the CA and adds the user to the wallet.
  let attributes = {
    firstName: args.firstName,
    lastName: args.lastName,
    speciality:args.speciality,
    role: "doctor"
  };
  const response = await network.registerUser(org, doctorId, JSON.stringify(attributes));

  // Delete the user from redis if the failed to register user in wallet
  // if (response.error) {
  //   (await redisClient).DEL(doctorId);
  //   res.status(400).send(response.error);
  // }

  console.log("Doctor successfully registered");
  res.status(201).send({
    username: doctorId,
    message: "Doctor successfully registered",
  });
};

exports.getDoctorsByOrgId = async (req, res) => {

  let { role, username, org, args } = req.body;
  await validateRole([ROLE_ADMIN], role, res);
  // Set up and connect to Fabric Gateway
  const networkObj = await network.connectToNetwork(username, org, res);
  // Use the gateway and identity service to get all users enrolled by the CA
  const response = await network.getAllDoctorsByOrgId(networkObj, org);
  (response.error) ? res.status(500).send(response.error) : res.status(200).send(response);
};

