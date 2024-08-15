import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
import { u128 } from "as-bignum/assembly";
import { RunesTransaction } from "metashrew-runes/assembly/indexer/RunesTransaction";
import { RuneSource } from "./RuneSource";
import { RuneId } from "metashrew-runes/assembly/indexer/RuneId";
import { BalanceSheet } from "metashrew-runes/assembly/indexer/BalanceSheet";
import { OutPoint, Input } from "metashrew-as/assembly/blockdata/transaction";
import { fromArrayBuffer } from "metashrew-runes/assembly/utils";
import { OUTPOINT_TO_RUNE_RANGES, RUNE_TO_OUTPOINT } from "../../tables";
import { OUTPOINT_TO_RUNES } from "metashrew-runes/assembly/indexer/constants";
import { Box } from "metashrew-as/assembly/utils/box";
import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { flatten, logArray, mixin, totalSupply, uniq } from "../../utils";
import { console } from "metashrew-as/assembly/utils";

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

export function pointsFromKeys(
  runeId: ArrayBuffer,
  ary: Array<ArrayBuffer>,
): Array<u128> {
  const res = flatten<u128>(
    ary.reduce(
      (r: PointsReduce, v: ArrayBuffer, i: i32, ary: Array<ArrayBuffer>) => {
        r.output.push(
          r.pointer
            .select(v)
            .getList()
            .map((v: ArrayBuffer) => fromArrayBuffer(v)),
        );
        return r;
      },
      PointsReduce.from(OUTPOINT_TO_RUNE_RANGES.select(runeId)),
    ).output,
  );
  return res;
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

export function sourceMapFromTransaction(
  tx: RunesTransaction,
): Map<string, RuneSource> {
  const inputs = tx.ins.map((v: Input, i: i32, ary: Array<Input>) =>
    v.previousOutput(),
  );
  const balanceSheets = inputs.map<BalanceSheet>(
    (v: OutPoint, i: i32, ary: Array<OutPoint>) => {
      return BalanceSheet.load(OUTPOINT_TO_RUNES.select(v.toArrayBuffer()));
    },
  );
  const allRunes = uniq(
    flatten<ArrayBuffer>(
      balanceSheets.map<Array<ArrayBuffer>>((v: BalanceSheet) => v.runes),
    ),
  );
  return allRunes.reduce((r: SourceMapReduce, v: ArrayBuffer) => {
    r.output.set(
      Box.from(v).toHexString(),
      new RuneSource(
        BSTU128.at(RUNE_TO_OUTPOINT.select(v)),
        pointsFromKeys(
          v,
          r.tx.ins.map<ArrayBuffer>((v: Input) =>
            v.previousOutput().toArrayBuffer(),
          ),
        ),
        totalSupply(RuneId.fromBytes(v)),
      ),
    );
    return r;
  }, SourceMapReduce.from(tx)).output;
}

export function sourceMapFromEtch(
  map: Map<string, RuneSource>,
  rune: ArrayBuffer,
): Map<string, RuneSource> {
  map.set(
    Box.from(rune).toHexString(),
    new RuneSource(
      BSTU128.at(RUNE_TO_OUTPOINT.select(rune)),
      [u128.from(0)],
      totalSupply(RuneId.fromBytes(rune)),
    ),
  );
  return map;
}

export class WithSourceMap {
  public source: Map<string, RuneSource> =
    changetype<Map<string, RuneSource>>(0);
  public tx: RunesTransaction = changetype<RunesTransaction>(0);
}

export class NumberingMixin {
  _setTransactionImpl<T extends WithSourceMap>(v: T, tx: RunesTransaction): T {
    v.tx = tx;
    v.source = sourceMapFromTransaction(tx);
    return v;
  }
  _etchHook<T extends WithSourceMap>(v: T, rune: ArrayBuffer): T {
    v.source = sourceMapFromEtch(v.source, rune);
    return v;
  }
  _fromImpl<S, T>(v: S): T {
    return changetype<T>(v);
  }
  _updateForEdictHookImplProtocolTag<T extends WithSourceMap>(
    v: T,
    edictAmount: u128,
    edictOutput: u32,
    runeId: ArrayBuffer,
    protocolTag: u128,
  ): void {
    const outpoint = OutPoint.from(v.tx.txid(), edictOutput).toArrayBuffer();
    const source = v.source.get(Box.from(runeId).toHexString()).pull();
    logArray(source.points, "POINTS");
    source.pipeTo(
      OUTPOINT_TO_RUNE_RANGES.select(runeId),
      outpoint,
      edictAmount,
      protocolTag,
    );
  }
  _updateForEdictHookImpl<T extends WithSourceMap>(
    v: T,
    edictAmount: u128,
    edictOutput: u32,
    runeId: ArrayBuffer,
  ): void {
    console.log(edictAmount.toString() + ", output:" + edictOutput.toString());
    mixin<NumberingMixin>()._updateForEdictHookImplProtocolTag<T>(
      v,
      edictAmount,
      edictOutput,
      runeId,
      u128.from(13),
    );
  }
}
