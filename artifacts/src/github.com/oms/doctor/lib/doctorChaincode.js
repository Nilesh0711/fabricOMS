/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");
let initDoctor = require("./initDoctors.json");

class DoctorChaincode extends Contract {

  // Init Ledger issues a new assets to the world state which runs only on deploy of chaincode
  async InitLedger(ctx) {
    for (const doctor of initDoctor) {
      // doctor.docType = "doctor";
      await ctx.stub.putState(doctor.id, Buffer.from(JSON.stringify(doctor)));
      console.info(`Doctor ${doctor.id} initialized`);
    }
  }

  async getAllDoctor(ctx,args) {
    // args = JSON.parse(args);
    // let id = args.id;
    // let userId = args.userId;
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push({ Key: result.value.key, Record: record });
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }

}

module.exports = DoctorChaincode;
