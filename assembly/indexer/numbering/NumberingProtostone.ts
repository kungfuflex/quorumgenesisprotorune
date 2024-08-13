import { u128 } from "as-bignum/assembly";
import { Protostone } from "protorune/assembly/indexer/Protostone";
import { RunesTransaction } from "metashrew-runes/assembly/indexer/RunesTransaction";
import { RuneSource } from "./RuneSource";
import { BalanceSheet } from "metashrew-runes/assembly/indexer/BalanceSheet";
import { mixin } from "../../utils";
import { NumberingMixinProtocol } from "./NumberingMixinProtocol";

export class NumberingProtostone extends Protostone {
  public source: Map<string, RuneSource>;
  public tx: RunesTransaction;
  _setTransaction(tx: RunesTransaction): NumberingProtostone {
    mixin<NumberingMixinProtocol>()._setTransactionImpl<NumberingProtostone>(
      this,
      tx,
    );
    return this;
  }
  updateBalancesForEdict(
    balancesByOutput: Map<u32, BalanceSheet>,
    balanceSheet: BalanceSheet,
    edictAmount: u128,
    edictOutput: u32,
    runeId: ArrayBuffer,
  ): void {
    super.updateBalancesForEdict(
      balancesByOutput,
      balanceSheet,
      edictAmount,
      edictOutput,
      runeId,
    );
    mixin<NumberingMixinProtocol>()._updateForEdictHookImpl(
      this,
      edictAmount,
      edictOutput,
      runeId,
    );
  }
  constructor(
    fields: Map<u64, Array<u128>>,
    edicts: Array<StaticArray<u128>>,
    protocolTag: u128,
  ) {
    super(fields, edicts, protocolTag);
    this.source = changetype<Map<string, RuneSource>>(0);
    this.tx = changetype<RunesTransaction>(0);
  }
  unwrap(): Protostone {
    return changetype<Protostone>(this);
  }
  static fromProtocolMessage(
    stone: Protostone,
    tx: RunesTransaction,
  ): NumberingProtostone {
    return new NumberingProtostone(
      stone.fields,
      stone.edicts,
      stone.protocolTag,
    )._setTransaction(tx);
  }
  static from<T>(v: T): NumberingProtostone {
    mixin<NumberingMixinProtocol>()._fromImpl<Protostone, NumberingProtostone>(
      v,
    );
  }
}
