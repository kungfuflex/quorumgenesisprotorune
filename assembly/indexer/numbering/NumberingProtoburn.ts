import { u128 } from "as-bignum/assembly";
import { Protoburn } from "protorune/assembly/indexer/Protoburn";

export class NumberingProtoburn extends Protoburn {
  hookBurn(rune: ArrayBuffer, amount: u128): void {}
  from<T>(burn: Protoburn, v: T): void {}
}
