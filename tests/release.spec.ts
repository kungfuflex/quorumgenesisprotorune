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
import { DEBUG_WASM } from "./utils/general";
import { IndexPointer } from "metashrew-test";

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
  }
  toBytes(): Buffer {
    const result = Buffer.allocUnsafe(16);
    result.writeUint64LE(0, this.height);
    result.writeUint64LE(this.txindex);
    return result;
  }
}

const addHexPrefix = (s) => s.substr(0, 2) === '0x' ? s : '0x' + s;

const toHex = (v) => addHexPrefix(v.toString('hex'));
const concat = (...args) => toHex(Buffer.concat(...args));

const u32 = (v: number): string => {
  const result = Buffer.allocUnsafe(4);
  result.writeUint32LE(0, v);
  return toHex(result);
};

const etchRune = (kv: any, { runeId, name, premine, outpoint }: any) => {
  kv[concat(Buffer.from('/height/byruneid'), runeId.toBytes())] = u32(height);
  kv[concat(Buffer.from("/runeid/byetching/"), name)] = toHex(runeId.toBytes());
  kv[concat(Buffer.from("/etching/byruneid/"), runeId.toBytes())] = toHex(Buffer.from(name));
  kv[concat(Buffer.from("/runes/premine/"), Buffer.from(name))] = toHex(premine);
}

describe("QUORUM•GENESIS•PROTORUNE", () => {
  before(async () => {
  });
  it("should", async () => {});
});
