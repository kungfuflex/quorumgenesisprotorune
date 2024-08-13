import { NumberingMixin, WithSourceMap } from "./NumberingMixin";
import { u128 } from "as-bignum/assembly";

class WithSourceMapProtocol extends WithSourceMap {
  protocolTag(): u128 {
    return u128.Zero;
  }
}

export class NumberingMixinProtocol extends NumberingMixin {
  _updateForEdictHook<T extends WithSourceMapProtocol>(
    v: T,
    edictAmount: u128,
    edictOutput: u32,
    runeId: ArrayBuffer,
  ): void {
    this._updateForEdictHookImplProtocolTag<T>(
      v,
      edictAmount,
      edictOutput,
      runeId,
      v.protocolTag(),
    );
  }
}
