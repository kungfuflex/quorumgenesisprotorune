import { u128 } from "as-bignum/assembly";
import { RunestoneMessage } from "metashrew-runes/assembly/indexer/RunestoneMessage";
import { RunesTransaction } from "metashrew-runes/assembly/indexer/RunesTransaction";
import { RuneSource } from "./RuneSource";
import { BalanceSheet } from "metashrew-runes/assembly/indexer/BalanceSheet";
import { NumberingMixin } from "./NumberingMixin";
import { logArray, mixin } from "../../utils";

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
    super.updateBalancesForEdict(
      balancesByOutput,
      balanceSheet,
      edictAmount,
      edictOutput,
      runeId,
    );
    mixin<NumberingMixin>()._updateForEdictHookImpl(
      this,
      edictAmount,
      edictOutput,
      runeId,
    );
  }
  mint(height: u32, balanceSheet: BalanceSheet): bool {
    const hasMinted = super.mint(height, balanceSheet);
    if (hasMinted) {
      //@TODO: hook into mint as well for count
    }
    return hasMinted;
  }
  etch(
    height: u64,
    tx: u32,
    initialBalanceSheet: BalanceSheet,
    transaction: RunesTransaction,
  ): bool {
    const runeId = this.buildRuneId(height, tx);
    const hasEtched = super.etch(height, tx, initialBalanceSheet, transaction);
    if (hasEtched) {
      const amount = initialBalanceSheet.has(runeId)
        ? initialBalanceSheet.get(runeId)
        : u128.Zero;
      if (amount != u128.Zero) {
        mixin<NumberingMixin>()._etchHook(this, runeId);
        mixin<NumberingMixin>()._updateForEdictHookImpl(
          this,
          amount,
          this.unallocatedTo,
          runeId,
        );
      }
    }
    return hasEtched;
  }
  constructor(
    fields: Map<u64, Array<u128>>,
    edicts: Array<StaticArray<u128>>,
    defaultOutput: i32,
  ) {
    super(fields, edicts, defaultOutput);
    this.source = changetype<Map<string, RuneSource>>(0);
    this.tx = changetype<RunesTransaction>(0);
  }
  unwrap(): RunestoneMessage {
    return mixin<NumberingMixin>()._fromImpl<
      NumberingRunestone,
      RunestoneMessage
    >(this);
  }
  static fromProtocolMessage(
    stone: RunestoneMessage,
    tx: RunesTransaction,
  ): NumberingRunestone {
    return new NumberingRunestone(
      stone.fields,
      stone.edicts,
      tx.defaultOutput(),
    )._setTransaction(tx);
  }
  handleLeftoverRunes(
    balanceSheet: BalanceSheet,
    balancesByOutput: Map<u32, BalanceSheet>,
  ): void {
    super.handleLeftoverRunes(balanceSheet, balancesByOutput);
    for (let i = 0; i < balanceSheet.runes.length; i++) {
      const rune = balanceSheet.runes[i];
      const amount = balanceSheet.get(rune);
      mixin<NumberingMixin>()._updateForEdictHookImpl(
        this,
        amount,
        this.unallocatedTo,
        rune,
      );
    }
  }
  static from<T extends RunestoneMessage>(v: T): NumberingRunestone {
    return mixin<NumberingMixin>()._fromImpl<
      RunestoneMessage,
      NumberingRunestone
    >(v);
  }
}
