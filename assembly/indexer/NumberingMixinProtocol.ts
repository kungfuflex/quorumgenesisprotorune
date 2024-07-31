import { NumberingMixin } from "./NumberingMixin";
import { u128 } from "as-bignum/assembly";

export class NumberingMixinProtocol extends NumberingMixin {
  _updateForEdictHook<T>(v: T, edictAmount: u128, edictOutput: u32, runeId: ArrayBuffer): void {
    this._updateForEdictHookImplProtocolTag<T>(v, edictAmount, edictOutput, runeId, v.protocolTag);
  }
}

