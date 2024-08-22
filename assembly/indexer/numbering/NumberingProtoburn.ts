import { u128 } from "as-bignum/assembly";
import { Protoburn } from "protorune/assembly/indexer/Protoburn";
import { NumberingMixin, WithSourceMap } from "./NumberingMixin";
import { mixin } from "../../utils";

export class NumberingProtoburn<T extends WithSourceMap> extends Protoburn {
  source: T = changetype<T>(0);
  hookBurn(rune: ArrayBuffer, amount: u128): void {
    mixin<NumberingMixin>()._updateForProtoburn(
      this.source,
      rune,
      this.pointer,
      this.protocolTag,
    );
  }
  static fromBurn<T extends WithSourceMap>(
    burn: Protoburn,
    v: T,
  ): NumberingProtoburn<T> {
    let numberingBurn = changetype<NumberingProtoburn<T>>(burn);
    numberingBurn.source = v;
    return numberingBurn;
  }
}
