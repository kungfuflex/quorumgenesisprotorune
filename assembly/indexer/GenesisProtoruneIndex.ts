import { Protostone } from "protorune/assembly/indexer/Protostone";
import { ProtoruneField as Field } from "protorune/assembly/indexer/fields/ProtoruneField";
import { ProtoruneBalanceSheet } from "protorune/assembly/indexer/ProtoruneBalanceSheet";
import { Edict } from "metashrew-runes/assembly/indexer/Edict";
import { RunestoneMessage } from "metashrew-runes/assembly/indexer/RunestoneMessage";
import { RunesTransaction } from "metashrew-runes/assembly/indexer/RunesTransaction";
import { RunesBlock } from "metashrew-runes/assembly/indexer/RunesBlock";
import { Numbering } from "./Numbering";
import { RUNE_TO_OUTPOINT } from "../tables";
import { QuorumMessageContext } from "./QuorumMessageContext";
import { Protorune } from "protorune/assembly/indexer";
import {
  Transaction,
  Input,
  Output,
  OutPoint,
} from "metashrew-as/assembly/blockdata/transaction";
import { fieldTo } from "metashrew-runes/assembly/utils";

export class GenesisProtoruneIndex extends Protorune<QuorumMessageContext> {
  processRunestone(
    block: RunesBlock,
    tx: RunesTransaction,
    txid: ArrayBuffer,
    height: u32,
    i: u32,
  ): RunestoneMessage {
    const baseRunestone = tx.runestone();
    const runestone = Numbering.fromProtocolMessage(
      Protostone.from(baseRunestone),
      tx
    );
    const unallocatedTo = runestone.fields.has(Field.POINTER)
      ? fieldTo<u32>(runestone.fields.get(Field.POINTER))
      : <u32>tx.defaultOutput();
    if (changetype<usize>(runestone) === 0)
      return changetype<RunestoneMessage>(0);
    const balancesByOutput = changetype<Map<u32, ProtoruneBalanceSheet>>(
      baseRunestone.process(tx, txid, height, i),
    );
    const protostones = runestone.protostones(tx.outs.length + 1);
    const burns = protostones.burns();

    const runestoneOutputIndex = tx.runestoneOutputIndex();
    const edicts = Edict.fromDeltaSeries(runestone.edicts);
    if (burns.length > 0) {
      this.processProtoburns(
        unallocatedTo,
        balancesByOutput,
        txid,
        runestoneOutputIndex,
        runestone.unwrap(),
        edicts,
        burns,
      );
    }
    this.processProtostones(protostones.flat(), block, height, tx, txid, i);
    return changetype<RunestoneMessage>(runestone);
  }
}
