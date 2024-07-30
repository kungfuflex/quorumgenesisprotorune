import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
import { u128 } from "as-bignum/assembly";
import { Protostone } from "protorune/assembly/indexer/Protostone";
import { BalanceSheet } from "metashrew-runes/assembly/indexer/BalanceSheet";
import { Edict } from "metashrew-runes/assembly/indexer/Edict";
import { Output } from "metashrew-as/assembly/indexer/blockdata/Output";
import { RUNE_TO_OUTPOINT } from "../tables";
import {
  AMOUNT,
  PREMINE,
  CAP,
  MINTS_REMAINING,
  RUNE_ID_TO_ETCHING
} from "metashrew-runes/assembly/constants";

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
  public output: Array<u128>;
  constructor(pointer: IndexPointer) {
    this.pointer = pointer;
    this.output = new Array<Array<u128>>(0);
  }
  static from(pointer: IndexPointer): PointsReduce {
    return new PointsReduce(pointer);
  }
}

export function pointsFromKeys(ary: Array<ArrayBuffer>): Array<u128> {
  return flatten<u128>(ary.reduce((r: PointsReduce, v: ArrayBuffer, i: i32, ary: Array<ArrayBuffer>) => {
    r.output.push(r.pointer.select(v).getList().map((v: ArrayBuffer) => fromArrayBuffer(v)));
    return r;
  }, PointsReduce.from(OUTPOINT_TO_RUNE_RANGES)).output);
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

export class Numbering<T extends RunestoneMessage> extends T {
  public source: Source;
  public sink: IndexPointer;
  public tx: RunesTransaction;
  _getTxid(): ArrayBuffer {
    const box = Box.from(this.sink);
    box.start += (box.len - 0x20);
    return box.setLength(0x20).toArrayBuffer();
  }
  _setTransaction(tx: RunesTransaction): NumberingProtostone {
    this.tx = tx;
    return this;
  }
  _setSource(txid: ArrayBuffer, source: Source, sink: IndexPointer): NumberingProtostone {
    this.source = source;
    this.sink = sink;
  }
  updateBalancesForEdict(
    balancesByOutput: Map<u32, BalanceSheet>,
    balanceSheet: BalanceSheet,
    edictAmount: u128,
    edictOutput: u32,
    runeId: ArrayBuffer,
  ): void {
    super.updateBalancesForEdict(balancesByOutput, balanceSheet, edictAmount, edictOutput, runeId);
    this.source.pipeTo(this.sink, primitiveToBuffer<u32>(edictOutput), amount);
  }
  constructor(
    fields: Map<u64, Array<u128>>,
    edicts: Array<StaticArray<u128>>,
    protocolTag: u128,
  ) {
    super(fields, edicts, protocolTag);
    this.tx = changetype<RunesTransaction>(0);
    this.source = changetype<Source>(0);
    this.sink = changetype<ArrayBuffer>(0);
  }
  asProtostone(): Protostone {
    return changetype<Protostone>(this);
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
    this._setDrain(new Source(BSTU128.at(RUNE_TO_OUTPOINT.select(runeId)), pointsFromKeys(this.tx.ins.map((v: Input, i: i32, ary: Array<Input>) => v.previousOutput())), totalSupply(runeId)), , 
    return super.processEdict(balancesByOutput, balanceSheet, edict, outputs);

    const edictOutput = toPrimitive<u32>(edict.output);
    if (edictOutput == outputs.length) {
      if (edict.amount.isZero()) {
        const numNonOpReturnOuts: u128 = this.numNonOpReturnOutputs(outputs);
        if (!numNonOpReturnOuts.isZero()) {
          const amountSplit = u128.div(
            balanceSheet.get(runeId),
            numNonOpReturnOuts,
          );
          const amountSplitPlus1 = amountSplit.preInc();
          const numRemainder = u128.rem(
            balanceSheet.get(runeId),
            numNonOpReturnOuts,
          );
          let extraCounter: u64 = 0;
          for (let i = 0; i < outputs.length; i++) {
            if (this.isNonOpReturnOutput(outputs[i])) {
              if (extraCounter < numRemainder.lo) {
                this.updateBalancesForEdict(
                  balancesByOutput,
                  balanceSheet,
                  amountSplitPlus1,
                  i,
                  runeId,
                );
                extraCounter++;
              } else {
                this.updateBalancesForEdict(
                  balancesByOutput,
                  balanceSheet,
                  amountSplit,
                  i,
                  runeId,
                );
              }
            }
          }
        }
      } else {
        for (let i = 0; i < outputs.length; i++) {
          if (this.isNonOpReturnOutput(outputs[i])) {
            this.updateBalancesForEdict(
              balancesByOutput,
              balanceSheet,
              edict.amount,
              i,
              runeId,
            );
          }
        }
      }

      return false;
    } else {
      this.updateBalancesForEdict(
        balancesByOutput,
        balanceSheet,
        edict.amount,
        edictOutput,
        runeId,
      );
      return false;
    }
  }
  static fromProtocolMessage(
    stone: T,
    ranges: BSTU128,
  ): NumberingProtostone<T> {
    return new NumberingProtostone(
      protostone.fields,
      protostone.edicts,
      protostone.protocolTag,
    )._setRanges(ranges);
  }
  static from<T>(v: T): NumberingProtostone {
    return changetype<NumberingProtostone>(v);
  }
}
