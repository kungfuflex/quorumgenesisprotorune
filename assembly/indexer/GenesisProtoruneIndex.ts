import { Protostone } from "protorune/assembly/indexer/Protostone";
import { ProtoruneField as Field } from "protorune/assembly/indexer/fields/ProtoruneField";
import { ProtoruneBalanceSheet } from "protorune/assembly/indexer/ProtoruneBalanceSheet";
import { Edict } from "metashrew-runes/assembly/indexer/Edict";
import { RunestoneMessage } from "metashrew-runes/assembly/indexer/RunestoneMessage";
import { RunesTransaction } from "metashrew-runes/assembly/indexer/RunesTransaction";
import { RunesBlock } from "metashrew-runes/assembly/indexer/RunesBlock";
import { NumberingRunestone, NumberingProtostone } from "./numbering";
import { QuorumMessageContext } from "./QuorumMessageContext";
import { Protorune } from "protorune/assembly/indexer";
import { fieldTo } from "metashrew-runes/assembly/utils";
import { console } from "metashrew-as/assembly/utils";

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
    const unallocatedTo = baseRunestone.fields.has(Field.POINTER)
      ? fieldTo<u32>(baseRunestone.fields.get(Field.POINTER))
      : <u32>tx.defaultOutput();
    const runestone = NumberingRunestone.fromProtocolMessage(baseRunestone, tx);
    const balancesByOutput = changetype<Map<u32, ProtoruneBalanceSheet>>(
      runestone.process(tx, txid, height, i),
    );
    const protostones = Protostone.from(runestone.unwrap()).protostones(
      tx.outs.length + 1,
    );
    const burns = protostones.burns();

    const runestoneOutputIndex = tx.runestoneOutputIndex();
    console.log("getting edicts");
    const edicts = Edict.fromDeltaSeries(runestone.edicts);
    if (burns.length > 0) {
      this.processProtoburns(
        unallocatedTo,
        balancesByOutput,
        txid,
        runestoneOutputIndex,
        Protostone.from(runestone.unwrap()),
        edicts,
        burns,
      );
    }
    this.processProtostones(protostones.flat(), block, height, tx, txid, i);
    return runestone;
  }
}
