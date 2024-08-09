import fs from "node:fs";

import * as path from "node:path";
import { expect } from "chai";
//@ts-ignore
import bitcoinjs = require("bitcoinjs-lib");
import {
  buildProgram,
  formatKv,
  TEST_BTC_ADDRESS1,
  TEST_BTC_ADDRESS2,
} from "metashrew-runes/lib/tests/utils/general";
import {
  initCompleteBlockWithRuneEtching,
  runesbyaddress,
  transferRune,
} from "metashrew-runes/lib/tests/utils/rune-helpers";
import {
  buildCoinbaseToAddress,
  buildDefaultBlock,
} from "metashrew-runes/lib/tests/utils/block-helpers";
import { createProtoruneFixture } from "protorune/tests/utils/fixtures";
import { DEBUG_WASM } from "./general";
import { IndexerProgram, IndexPointer } from "metashrew-test";
import { constructProtostoneTx } from "protorune/tests/utils/protoburn";
import { inspect } from "node:util";

class RuneId {
  public height: number;
  public txindex: number;
  constuctor(height: number, txindex: number) {
    this.height = height;
    this.txindex = txindex;
  }
  static from({ height, txindex }: any): RuneId {
    const runeId = new RuneId();
    runeId.height = height;
    runeId.txindex = txindex;
    return runeId;
  }
  toBytes(): Buffer {
    const result = Buffer.allocUnsafe(16);
    result.writeUintLE(this.height, 0, 16);
    result.writeUintLE(this.txindex, 16, 16);
    return result;
  }
}
const TEST_PROTOCOL_TAG = BigInt("20000024");
const addHexPrefix = (s) => (s.substr(0, 2) === "0x" ? s : "0x" + s);

const toHex = (v) => addHexPrefix(v.toString("hex"));
const concat = (...args: any[]) => toHex(Buffer.concat(args));

const u32 = (v: number): string => {
  const result = Buffer.allocUnsafe(4);
  result.writeUint32LE(0, v);
  return toHex(result);
};

const etchRune = (kv: any, { runeId, name, premine, outpoint }: any) => {
  kv[concat(Buffer.from("/height/byruneid"), runeId.toBytes())] = u32(
    runeId.height,
  );
  kv[concat(Buffer.from("/runeid/byetching/"), name)] = toHex(runeId.toBytes());
  kv[concat(Buffer.from("/etching/byruneid/"), runeId.toBytes())] = toHex(
    Buffer.from(name),
  );
  kv[concat(Buffer.from("/runes/premine/"), Buffer.from(name))] =
    toHex(premine);
};

describe("QUORUM•GENESIS•PROTORUNE", () => {
  let program: IndexerProgram;
  before(async () => {
    program = buildProgram(DEBUG_WASM);
    program.setBlockHeight(840000);
  });
  it("should test numbering on runestones", async () => {
    let { runeId, block, output, refundOutput, input, premineAmount } =
      await createProtoruneFixture(false);
    program.setBlock(block.toHex());

    await program.run("_start");
  });
});
