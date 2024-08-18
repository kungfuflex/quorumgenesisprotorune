import { u128 } from "as-bignum/assembly/integer";
import {
  CAP,
  MINTS_REMAINING,
  PREMINE,
  RUNE_ID_TO_ETCHING,
  AMOUNT,
} from "metashrew-runes/assembly/indexer/constants";
import { RuneId } from "metashrew-runes/assembly/indexer/RuneId";
import { fromArrayBuffer } from "metashrew-runes/assembly/utils";

export class Rune {
  name: ArrayBuffer;
  amount: u128;
  cap: u128;
  premine: u128;
  constructor(runeId: ArrayBuffer) {
    const name = RUNE_ID_TO_ETCHING.select(runeId).get();
    this.amount = fromArrayBuffer(AMOUNT.select(name).get());
    this.name = name;
    this.cap = fromArrayBuffer(CAP.select(name).get());
    this.premine = fromArrayBuffer(PREMINE.select(name).get());
  }
  totalSupply(): u128 {
    let result: u128 = this.premine;
    if (this.cap.isZero()) return result;
    const mintsRemaining: u128 = fromArrayBuffer(
      MINTS_REMAINING.select(this.name).get()
    );
    let numMints = this.cap;
    if (this.cap !== mintsRemaining) numMints = this.cap - mintsRemaining;
    //@ts-ignore
    result += fromArrayBuffer(AMOUNT.select(this.name).get()) * numMints;
    return result;
  }
}
