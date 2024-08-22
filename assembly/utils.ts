import { u128 } from "as-bignum/assembly/integer";
import { CAP, MINTS_REMAINING, PREMINE, RUNE_ID_TO_ETCHING, AMOUNT } from "metashrew-runes/assembly/indexer/constants";
import { RuneId } from "metashrew-runes/assembly/indexer/RuneId";
import { fromArrayBuffer  } from "metashrew-runes/assembly/utils";
import { console } from "metashrew-as/assembly/utils/logging"

//@ts-ignore
@inline
export function mixin<T>(): T {
  return changetype<T>(0);
}

export function flatten<T>(ary: Array<Array<T>>): Array<T> {
  const result = new Array<T>(0);
  for (let i = 0; i < ary.length; i++) {
    for (let j = 0; j < ary[i].length; j++) {
      result.push(ary[i][j]);
    }
  }
  return result;
}
export function has(ary: Array<ArrayBuffer>, needle: ArrayBuffer): boolean {
  for (let i = 0; i < ary.length; i++) {
    if (
      ary[i].byteLength === needle.byteLength &&
      memory.compare(
        changetype<usize>(ary[i]),
        changetype<usize>(needle),
        <usize>needle.byteLength,
      ) === 0
    )
      return true;
  }
  return false;
}

export function uniq(ary: Array<ArrayBuffer>): Array<ArrayBuffer> {
  return ary.reduce(
    (
      r: Array<ArrayBuffer>,
      v: ArrayBuffer,
      i: i32,
      ary: Array<ArrayBuffer>,
    ) => {
      if (!has(r, v)) r.push(v);
      return r;
    },
    new Array<ArrayBuffer>(0),
  );
}

export function totalSupply(runeId: RuneId): u128 {
  const runeIdBytes = runeId.toBytes();
  const name = RUNE_ID_TO_ETCHING.select(runeIdBytes).get();

  let result: u128 = fromArrayBuffer(PREMINE.select(name).get());
  const cap: u128 = fromArrayBuffer(CAP.select(name).get());
  if (cap.isZero()) return result;
  const mintsRemaining: u128 = fromArrayBuffer(
    MINTS_REMAINING.select(name).get(),
  );
  let numMints = cap
  if(cap !== mintsRemaining) numMints = cap - mintsRemaining
  //@ts-ignore
  result += fromArrayBuffer(AMOUNT.select(name).get()) * (numMints);
  return result;
}

class Stringifiable {
  toString(): string {
    return ""
  }
}

export function logArray<T extends Stringifiable>(ary: Array<T>, title: string = ""): void {
  console.log("-------------------------------------------------------------------")
  if(title.length > 0) console.log(title)
  console.log("Logging array of type [" + nameof<T>()+"] and length: " + ary.length.toString());
  console.log("[")
  let str = "'"
  for (let i = 0; i < ary.length; i++) {
    str +="\n  " + "[" + i.toString() + "]: " + ary[i].toString();
  }
  console.log(str)
  console.log("]")
  console.log("-------------------------------------------------------------------")
}
