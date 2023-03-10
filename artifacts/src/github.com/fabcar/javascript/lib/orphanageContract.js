/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");
let initOrphange = require("./initLedger.json");

class OrphanageContract extends Contract {

  // Init Ledger issues a new assets to the world state which runs only on deploy of chaincode
  async InitLedger(ctx) {
    // console.log('\n============= START : Initialize Ledger ===========\n');
    for (const orphan of initOrphange) {
      // orphan.docType = "orphan";
      await ctx.stub.putState(orphan.id, Buffer.from(JSON.stringify(orphan)));
      console.info(`Orphan ${orphan.id} initialized`);
    }
    // console.log('\n============= END : Initialize Ledger ===========\n');
  }

  // CreateAsset issues a new asset to the world state with given details.
  // async CreateOrphan(ctx, args) {
  //   args = JSON.parse(args);
  //   let id = args.id;
  //   let firstName = args.firstName;
  //   let lastName = args.lastName;
  //   let age = args.age;
  //   let gender = args.gender;
  //   let org = args.org;
  //   let background = args.background;
  //   const exists = await this.OrphanExists(ctx, JSON.stringify(args));
  //   if (exists) {
  //     throw new Error(`The asset ${id} does not exist`);
  //   }
  //   const orphan = {
  //     ID: id,
  //     firstName: firstName,
  //     lastName: lastName,
  //     Age: age,
  //     Gender: gender,
  //     Org: org,
  //     Background: background,
  //   };
  //   ctx.stub.putState(id, Buffer.from(JSON.stringify(orphan)));
  //   return JSON.stringify(orphan);
  // }

  // ReadAsset returns the asset stored in the world state with given id.
  async ReadOrphan(ctx, args) {
    args = JSON.parse(args);
    let userId = args.userId;
    const dataJSON = await ctx.stub.getState(userId); // get the asset from chaincode state
    if (!dataJSON || dataJSON.length === 0) {
      throw new Error(`The orphan ${id} does not exist`);
    }
    return dataJSON.toString();
  }

  // UpdateAsset updates an existing asset in the world state with provided parameters.
  // async UpdateOrphan(ctx, args) {
  //   args = JSON.parse(args);
  //   let id = args.id;
  //   let firstName = args.firstName;
  //   let lastName = args.lastName;
  //   let age = args.age;
  //   let gender = args.gender;
  //   let org = args.org;
  //   let background = args.background;
  //   const exists = await this.OrphanExists(ctx, JSON.stringify(args));
  //   if (!exists) {
  //     throw new Error(`The asset ${id} does not exist`);
  //   }

  //   // overwriting original asset with new asset
  //   const updatedOrphan = {
  //     ID: id,
  //     firstName: firstName,
  //     lastName: lastName,
  //     Age: age,
  //     Gender: gender,
  //     Org: org,
  //     Background: background,
  //   };
  //   return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedOrphan)));
  // }

  // DeleteAsset deletes an given asset from the world state.
  // async DeleteOrphan(ctx, args) {
  //   args = JSON.parse(args);
  //   let id = args.id;
  //   const exists = await this.OrphanExists(ctx, JSON.stringify(args));
  //   if (!exists) {
  //     throw new Error(`The asset ${id} does not exist`);
  //   }
  //   return ctx.stub.deleteState(id);
  // }

  // AssetExists returns true when asset with given ID exists in world state.
  async OrphanExists(ctx, args) {
    args = JSON.parse(args);
    let userId = args.userId;
    const dataJSON = await ctx.stub.getState(userId);
    return dataJSON && dataJSON.length > 0;
  }

  // GetAllAssets returns all assets found in the world state.
  async GetAllOrphan(ctx,args) {
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

  async GetHistoryForOrphan(ctx, args) {
    args = JSON.parse(args);
    let userId = args.userId;
    let resultsIterator = await ctx.stub.getHistoryForKey(userId);
    let results = await this.GetAllResults(resultsIterator, true);
    return JSON.stringify(results);
  }

  async GetAllResults(iterator, isHistory) {
    let allResults = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString("utf8"));
        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString("utf8");
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString("utf8");
          }
        }
        allResults.push(jsonRes);
      }
      res = await iterator.next();
    }
    iterator.close();
    return allResults;
  }

}

module.exports = OrphanageContract;
