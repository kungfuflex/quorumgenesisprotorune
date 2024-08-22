import { Protostone } from "protorune/assembly/indexer/Protostone";
import { ProtoruneField as Field } from "protorune/assembly/indexer/fields/ProtoruneField";
import { ProtoruneBalanceSheet } from "protorune/assembly/indexer/ProtoruneBalanceSheet";
import { Edict } from "metashrew-runes/assembly/indexer/Edict";
import { RunestoneMessage } from "metashrew-runes/assembly/indexer/RunestoneMessage";
import { RunesTransaction } from "metashrew-runes/assembly/indexer/RunesTransaction";
import { RunesBlock } from "metashrew-runes/assembly/indexer/RunesBlock";
import {
  NumberingRunestone,
  NumberingProtostone,
  NumberingProtoburn,
} from "./numbering";
import { QuorumMessageContext } from "./QuorumMessageContext";
import { Protorune } from "protorune/assembly/indexer";
import { fieldTo } from "metashrew-runes/assembly/utils";
import { console, encodeHexFromBuffer } from "metashrew-as/assembly/utils";

function expandToNumberingAlign(
  v: Array<Protostone>,
  tx: RunesTransaction,
): Array<Protostone> {
  const result = new Array<Protostone>(0);
  for (let i = 0; i < v.length; i++) {
    result.push(NumberingProtostone.fromProtocolMessage(v[i], tx).unwrap());
  }
  return result;
}

class ProtostoneReduce {
  tx: RunesTransaction;
  stones: Array<NumberingProtostone> = new Array<NumberingProtostone>();
  constructor(tx: RunesTransaction) {
    this.tx = tx;
  }
}

export class GenesisProtoruneIndex extends Protorune<QuorumMessageContext> {
  processRunestone(
    block: RunesBlock,
    tx: RunesTransaction,
    txid: ArrayBuffer,
    height: u32,
    i: u32,
  ): RunestoneMessage {
    const baseRunestone = tx.runestone();
    if (changetype<usize>(baseRunestone) === 0)
      return changetype<RunestoneMessage>(0);
    const runestone = NumberingRunestone.fromProtocolMessage(baseRunestone, tx);
    const balancesByOutput = changetype<Map<u32, ProtoruneBalanceSheet>>(
      runestone.process(tx, txid, height, i),
    );
    const protostones = Protostone.from(runestone.unwrap()).protostones(
      tx.outs.length + 1,
    );
    const burns = protostones
      .burns()
      .map<NumberingProtoburn>((b) => changetype<NumberingProtoburn>(b));

    const runestoneOutputIndex = tx.runestoneOutputIndex();
    const edicts = Edict.fromDeltaSeries(runestone.edicts);

    if (burns.length > 0) {
      this.processProtoburns(
        baseRunestone.unallocatedTo,
        balancesByOutput,
        txid,
        runestoneOutputIndex,
        Protostone.from(runestone.unwrap()),
        edicts,
        burns,
      );
    }
    const stones = protostones.flat().reduce((reduce, stone) => {
      reduce.stones.push(
        NumberingProtostone.fromProtocolMessage(stone, reduce.tx),
      );
      return reduce;
    }, new ProtostoneReduce(tx)).stones;
    this.processProtostones(stones, block, height, tx, txid, i);
    return runestone;
  }
}
