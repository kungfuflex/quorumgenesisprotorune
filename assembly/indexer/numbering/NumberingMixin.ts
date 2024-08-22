import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
import { u128 } from "as-bignum/assembly";
import { RunesTransaction } from "metashrew-runes/assembly/indexer/RunesTransaction";
import { RuneSource } from "./RuneSource";
import { RuneId } from "metashrew-runes/assembly/indexer/RuneId";
import { BalanceSheet } from "metashrew-runes/assembly/indexer/BalanceSheet";
import { OutPoint, Input } from "metashrew-as/assembly/blockdata/transaction";
import {
  fromArrayBuffer,
  isEqualArrayBuffer,
  toArrayBuffer,
} from "metashrew-runes/assembly/utils";
import { OUTPOINT_TO_RUNE_RANGES, RUNE_TO_OUTPOINT } from "../../tables";
import { OUTPOINT_TO_RUNES } from "metashrew-runes/assembly/indexer/constants";
import { ProtoruneTable } from "protorune/assembly/indexer/tables/protorune";
import { Box } from "metashrew-as/assembly/utils/box";
import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { flatten, logArray, mixin, totalSupply, uniq } from "../../utils";
import { Rune } from "../Rune";
import { console, encodeHexFromBuffer } from "metashrew-as/assembly/utils";

class PointsReduce {
  public pointer: IndexPointer;
  public output: Array<Array<u128>>;
  public protocolId: ArrayBuffer;
  constructor(pointer: IndexPointer, protocolId: ArrayBuffer) {
    this.pointer = pointer;
    this.output = new Array<Array<u128>>(0);
    this.protocolId = protocolId;
  }
  static from(pointer: IndexPointer, protocolId: ArrayBuffer): PointsReduce {
    return new PointsReduce(pointer, protocolId);
  }
}

export function pointsFromKeys(
  runeId: ArrayBuffer,
  ary: Array<ArrayBuffer>,
  protocolId: u128,
): Array<u128> {
  const res = flatten<u128>(
    ary.reduce(
      (r: PointsReduce, v: ArrayBuffer, i: i32, ary: Array<ArrayBuffer>) => {
        console.log(
          fromArrayBuffer(
            r.pointer.select(v).keyword("/protocol").get(),
          ).toString(),
        );
        if (
          isEqualArrayBuffer(
            r.pointer.select(v).keyword("/protocol").get(),
            r.protocolId,
          )
        )
          r.output.push(
            r.pointer
              .select(v)
              .getList()
              .map((d: ArrayBuffer) => fromArrayBuffer(d)),
          );
        return r;
      },
      PointsReduce.from(
        OUTPOINT_TO_RUNE_RANGES.select(runeId),
        toArrayBuffer(protocolId),
      ),
    ).output,
  );
  return res;
}

class SourceMapReduce {
  public output: Map<string, RuneSource>;
  public tx: RunesTransaction;
  public protocolId: u128;
  constructor(tx: RunesTransaction, protocolId: u128) {
    this.tx = tx;
    this.protocolId = protocolId;
    this.output = new Map<string, RuneSource>();
  }
  static from(tx: RunesTransaction, protocolId: u128): SourceMapReduce {
    return new SourceMapReduce(tx, protocolId);
  }
}

export function sourceMapFromTransaction(
  tx: RunesTransaction,
  ptr: IndexPointer,
  protocolId: u128,
): Map<string, RuneSource> {
  const inputs = tx.ins.map((v: Input, i: i32, ary: Array<Input>) =>
    v.previousOutput(),
  );
  const balanceSheets = new Array<BalanceSheet>();
  for (let i = 0; i < inputs.length; i++) {
    balanceSheets.push(
      BalanceSheet.load(ptr.select(inputs[i].toArrayBuffer())),
    );
  }
  const allRunes = uniq(
    flatten<ArrayBuffer>(
      balanceSheets.map<Array<ArrayBuffer>>((v: BalanceSheet) => v.runes),
    ),
  );
  return allRunes.reduce(
    (r: SourceMapReduce, v: ArrayBuffer) => {
      r.output.set(
        Box.from(v).toHexString(),
        new RuneSource(
          BSTU128.at(RUNE_TO_OUTPOINT.select(v)),
          pointsFromKeys(
            v,
            r.tx.ins.map<ArrayBuffer>((v: Input) =>
              v.previousOutput().toArrayBuffer(),
            ),
            r.protocolId,
          ),
          totalSupply(RuneId.fromBytes(v)),
        ),
      );
      return r;
    },
    SourceMapReduce.from(tx, protocolId),
  ).output;
}

export function sourceMapFromEtch(
  map: Map<string, RuneSource>,
  rune: ArrayBuffer,
  protocolId: u128,
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
export function updateSourceMapForMint(
  map: Map<string, RuneSource>,
  _rune: ArrayBuffer,
): Map<string, RuneSource> {
  console.log("updating mint sourcemap");
  const rune = new Rune(_rune);
  const supply = rune.totalSupply();
  const runeIdString = Box.from(_rune).toHexString();
  let source: RuneSource;
  if (map.has(runeIdString)) {
    source = map.get(runeIdString);
    source.refetch(supply);
    logArray(source.distances);
  } else {
    source = new RuneSource(
      BSTU128.at(RUNE_TO_OUTPOINT.select(_rune)),
      [supply - rune.amount],
      supply,
    );
  }
  map.set(runeIdString, source);
  return map;
}

export class WithSourceMap {
  public source: Map<string, RuneSource> =
    changetype<Map<string, RuneSource>>(0);
  public tx: RunesTransaction = changetype<RunesTransaction>(0);
}

export class NumberingMixin {
  _setTransactionImpl<T extends WithSourceMap>(v: T, tx: RunesTransaction): T {
    return this._setTransactionImplProtocol(v, tx, u128.from(13));
  }
  _setTransactionImplProtocol<T extends WithSourceMap>(
    v: T,
    tx: RunesTransaction,
    protocolId: u128,
  ): T {
    let ptr: IndexPointer;
    if (protocolId == u128.from(13)) {
      ptr = OUTPOINT_TO_RUNES;
    } else {
      ptr = ProtoruneTable.for(protocolId).OUTPOINT_TO_RUNES;
    }
    v.tx = tx;
    v.source = sourceMapFromTransaction(tx, ptr, protocolId);
    return v;
  }
  _etchHook<T extends WithSourceMap>(v: T, rune: ArrayBuffer): T {
    return this._etchHookProtocol(v, rune, u128.from("13"));
  }
  _etchHookProtocol<T extends WithSourceMap>(
    v: T,
    rune: ArrayBuffer,
    protocolId: u128,
  ): T {
    v.source = sourceMapFromEtch(v.source, rune, protocolId);
    return v;
  }
  _mintHook<T extends WithSourceMap>(v: T, rune: ArrayBuffer): T {
    v.source = updateSourceMapForMint(v.source, rune);
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
    mixin<NumberingMixin>()._updateForEdictHookImplProtocolTag<T>(
      v,
      edictAmount,
      edictOutput,
      runeId,
      u128.from(13),
    );
  }
}
