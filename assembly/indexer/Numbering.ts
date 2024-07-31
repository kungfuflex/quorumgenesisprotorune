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

export function flatten<T>(ary: Array<Array<T>>): Array<T> {
  const result = new Array<T>(0);
  for (let i = 0; i < ary.length; i++) {
    for (let j = 0; j < ary[i].length; j++) {
      result.push(ary[i][j]);
    }
  }
  return result;
}

class PointsReduce {
  public pointer: IndexPointer;
  public output: Array<Array<u128>>;
  constructor(pointer: IndexPointer) {
    this.pointer = pointer;
    this.output = new Array<Array<u128>>(0);
  }
  static from(pointer: IndexPointer): PointsReduce {
    return new PointsReduce(pointer);
  }
}

export function pointsFromKeys(runeId: ArrayBuffer, ary: Array<ArrayBuffer>): Array<u128> {
  return flatten<u128>(ary.reduce((r: PointsReduce, v: ArrayBuffer, i: i32, ary: Array<ArrayBuffer>) => {
    r.output.push(r.pointer.select(v).getList().map((v: ArrayBuffer) => fromArrayBuffer(v)));
    return r;
  }, PointsReduce.from(OUTPOINT_TO_RUNE_RANGES.select(runeId))).output);
}

export function totalSupply(runeId: RuneId): u128 {
  const runeIdBytes = runeId.toBytes();
  const name = RUNE_ID_TO_ETCHING.select(runeIdBytes).get();

  let result: u128 = fromArrayBuffer(PREMINE.select(name).get());
  const cap: u128 = fromArrayBuffer(CAP.select(name).get());
  if (cap.isZero()) return result;
  const mintsRemaining: u128 = fromArrayBuffer(MINTS_REMAINING.select(name).get());
  if (mintsRemaining !== cap) result += (fromArrayBuffer(AMOUNT.select(name).get())*(cap - mintsRemaining));
  return result;
}

export function has(ary: Array<ArrayBuffer>, needle: ArrayBuffer): boolean {
  for (let i = 0; i < ary.length; i++) {
    if (ary[i].byteLength === needle.byteLength && memory.compare(changetype<usize>(ary[i]), changetype<usize>(needle), <usize>needle.byteLength) === 0) return true;
  }
  return false;
}

export function uniq(ary: Array<ArrayBuffer>): Array<ArrayBuffer> {
  return ary.reduce((r: Array<ArrayBuffer>, v: ArrayBuffer, i: i32, ary: Array<ArrayBuffer>) => {
    if (!has(r, v)) r.push(v);
    return r;
  }, new Array<ArrayBuffer>(0));
}

class SourceMapReduce {
  public output: Map<string, RuneSource>;
  public tx: RunesTransaction;
  constructor(tx: RunesTransaction) {
    this.tx = tx;
    this.output = new Map<string, RuneSource>();
  }
  static from(tx: RunesTransaction): SourceMapReduce {
    return new SourceMapReduce(tx);
  }
}

export function sourceMapFromTransaction(tx: RunesTransaction): Map<string, RuneSource> {
  const inputs = tx.ins.map((v: Input, i: i32, ary: Array<Input>) => v.previousOutput());
  const balanceSheets = inputs.map<BalanceSheet>((v: OutPoint, i: i32, ary: Array<OutPoint>) => {
    return BalanceSheet.load(OUTPOINT_TO_RUNES.select(v.toArrayBuffer()));
  }); 
  const allRunes = uniq(flatten<ArrayBuffer>(balanceSheets.map<Array<ArrayBuffer>>((v: BalanceSheet) => v.runes)));
  return allRunes.reduce((r: SourceMapReduce, v: ArrayBuffer, i: i32, ary: Array<ArrayBuffer>) => {
    r.output.set(Box.from(v).toHexString(), new RuneSource(BSTU128.at(RUNE_TO_OUTPOINT.select(v)), pointsFromKeys(v, r.tx.ins.map<ArrayBuffer>((v: Input, i: i32, ary: Array<Input>) => v.previousOutput().toArrayBuffer())), totalSupply(RuneId.fromBytes(v))));
    return r;
  }, SourceMapReduce.from(tx)).output;
}

export class Numbering<T extends RunestoneMessage> extends RunestoneMessage {
  public source: Map<string, RuneSource>;
  public tx: RunesTransaction;
  _setTransaction(tx: RunesTransaction): Numbering<T> {
    this.tx = tx;
    this.source = sourceMapFromTransaction(tx);
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
    this.source.get(Box.from(runeId).toHexString()).pipeTo(OUTPOINT_TO_RUNE_RANGES.select(runeId), OutPoint.from(this.tx.txid(), edictOutput).toArrayBuffer(), edictAmount);
  }
  constructor(
    fields: Map<u64, Array<u128>>,
    edicts: Array<StaticArray<u128>>
  ) {
    super(fields, edicts);
    this.source = changetype<Map<string, RuneSource>>(0);
    this.tx = changetype<RunesTransaction>(0);
  }
  unwrap(): T {
    return changetype<T>(this);
  }
  processEdict(
    balancesByOutput: Map<u32, BalanceSheet>,
    balanceSheet: BalanceSheet,
    edict: Edict,
    outputs: Array<Output>,
  ): bool {
    if (edict.block.isZero() && !edict.transactionIndex.isZero()) {
      return true;
    }
    const runeId = edict.runeId();
    return super.processEdict(balancesByOutput, balanceSheet, edict, outputs);
  }
  static fromProtocolMessage<T extends RunestoneMessage>(
    stone: T,
    tx: RunesTransaction
  ): Numbering<T> {
    return new Numbering<T>(
      stone.fields,
      stone.edicts
    )._setTransaction(tx);
  }
  static from<T>(v: T): Numbering {
    return changetype<Numbering>(v);
  }
}
