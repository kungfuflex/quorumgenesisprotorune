import { u128 } from "as-bignum";
import { Protoburn } from "protorune/assembly/indexer/Protoburn";

export class NumberingProtoburn extends Protoburn {
  hookBurn(rune: ArrayBuffer, amount: u128): void {}
}
