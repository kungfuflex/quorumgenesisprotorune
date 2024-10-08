"use strict";

import * as quorumwallet from "./wallet";
import * as wallet from "metashrew-runes/lib/src.ts/wallet";
import url from "url";
import { OutPoint, RuneOutput } from "metashrew-runes/lib/src.ts/outpoint";
import { ProtorunesRpc } from "protorune/lib/src.ts/rpc";

const addHexPrefix = (s) => (s.substr(0, 2) === "0x" ? s : "0x" + s);

let id = 0;

export class QuorumRpc extends ProtorunesRpc {
  async runerange({ outpoints, runeId, protocolId }: any): Promise<{
    balances: RuneOutput[];
  }> {
    const buffer = quorumwallet.encodeRuneRangeInput(
      outpoints,
      runeId,
      protocolId,
    );
    const byteString = await this._call({
      method: "runerange",
      input: buffer,
    });
    const decoded = quorumwallet.decodeRuneRangeOutput(byteString);
    return decoded as any;
  }
}
