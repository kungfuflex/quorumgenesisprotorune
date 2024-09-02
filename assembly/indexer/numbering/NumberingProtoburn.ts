import { u128 } from "as-bignum/assembly";
import { Protoburn } from "protorune/assembly/indexer/Protoburn";
import { NumberingMixin, WithSourceMap } from "./NumberingMixin";
import { mixin } from "../../utils";
import { console } from "metashrew-as/assembly/utils";
import * as base from "metashrew-runes/assembly/indexer/constants";
import { ProtoruneBalanceSheet } from "protorune/assembly/indexer/ProtoruneBalanceSheet";

export class NumberingProtoburn<T extends WithSourceMap> extends Protoburn {
  source: T = changetype<T>(0);
  hookBurn(rune: ArrayBuffer, amount: u128): void {
    console.log("hooking into burn");
    mixin<NumberingMixin>()._updateForProtoburn(
      this.source,
      rune,
      this.pointer,
      this.protocolTag,
      amount,
    );
  }
  process(balanceSheet: ProtoruneBalanceSheet, outpoint: ArrayBuffer): void {
    for (let i = 0; i < balanceSheet.runes.length; i++) {
      const runeId = balanceSheet.runes[i];
      const name = base.RUNE_ID_TO_ETCHING.select(runeId).get();
      this.table.RUNE_ID_TO_ETCHING.select(runeId).set(name);
      this.table.ETCHING_TO_RUNE_ID.select(name).set(runeId);
      this.table.SPACERS.select(name).set(base.SPACERS.select(name).get());
      this.table.DIVISIBILITY.select(name).set(
        base.DIVISIBILITY.select(name).get(),
      );
      this.table.SYMBOL.select(name).set(base.SYMBOL.select(name).get());
      this.table.ETCHINGS.append(name);
      balanceSheet.saveIndex(i, this.table.OUTPOINT_TO_RUNES.select(outpoint));
      this.hookBurn(runeId, balanceSheet.balances[i]);
    }
  }
  static fromBurn<T extends WithSourceMap>(
    burn: Protoburn,
    v: T,
  ): NumberingProtoburn<T> {
    console.log("converting burn to numberingburn");
    let numberingBurn = changetype<NumberingProtoburn<T>>(burn);
    numberingBurn.source = v;
    return numberingBurn;
  }
}
