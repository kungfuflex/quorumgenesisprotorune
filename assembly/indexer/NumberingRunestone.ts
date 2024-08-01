import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
import { u128 } from "as-bignum/assembly";
import { Protostone } from "protorune/assembly/indexer/Protostone";
import { RunestoneMessage } from "metashrew-runes/assembly/indexer/RunestoneMessage";
import { RunesTransaction } from "metashrew-runes/assembly/indexer/RunesTransaction";
import { RuneSource } from "./RuneSource";
import { RuneId } from "metashrew-runes/assembly/indexer/RuneId";
import { BalanceSheet } from "metashrew-runes/assembly/indexer/BalanceSheet";
import { Edict } from "metashrew-runes/assembly/indexer/Edict";
import { OutPoint, Input, Output } from "metashrew-as/assembly/blockdata/transaction";
import { primitiveToBuffer } from "metashrew-as/assembly/utils";
import { toArrayBuffer, fromArrayBuffer } from "metashrew-runes/assembly/utils";
import { OUTPOINT_TO_RUNE_RANGES, RUNE_TO_OUTPOINT } from "../tables";
import { OUTPOINT_TO_RUNES } from "metashrew-runes/assembly/indexer/constants";
import { Box } from "metashrew-as/assembly/utils/box";
import {
  AMOUNT,
  PREMINE,
  CAP,
  MINTS_REMAINING,
  RUNE_ID_TO_ETCHING
} from "metashrew-runes/assembly/indexer/constants";
import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { NumberingMixin } from "./NumberingMixin";
import { mixin } from "../utils";


export class NumberingRunestone extends RunestoneMessage {
  public source: Map<string, RuneSource>;
  public tx: RunesTransaction;
  _setTransaction(tx: RunesTransaction): NumberingRunestone {
    mixin<NumberingMixin>()._setTransactionImpl<NumberingRunestone>(this, tx);
    return this;
  }
  updateBalancesForEdict(
    balancesByOutput: Map<u32, BalanceSheet>,
    balanceSheet: BalanceSheet,
    edictAmount: u128,
    edictOutput: u32,
    runeId: ArrayBuffer,
  ): void {
    super.updateBalancesForEdict(balancesByOutput, balanceSheet, edictAmount, edictOutput, runeId);
    changetype<NumberingMixin>(0)._updateForEdictHookImpl(this, edictAmount, edictOutput, runeId);
  }
  constructor(
    fields: Map<u64, Array<u128>>,
    edicts: Array<StaticArray<u128>>
  ) {
    super(fields, edicts);
    this.source = changetype<Map<string, RuneSource>>(0);
    this.tx = changetype<RunesTransaction>(0);
  }
  unwrap(): RunestoneMessage {
    return mixin<NumberingMixin>()._fromImpl<NumberingRunestone, RunestoneMessage>(this);
  }
  static fromProtocolMessage(
    stone: RunestoneMessage,
    tx: RunesTransaction
  ): NumberingRunestone {
    return new NumberingRunestone(
      stone.fields,
      stone.edicts
    )._setTransaction(tx);
  }
  static from<T>(v: T): NumberingRunestone {
    mixin<NumberingMixin>()._fromImpl<RunestoneMessage, NumberingRunestone>(v);
  }
}
