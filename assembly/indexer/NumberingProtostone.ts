import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
import { u128 } from "as-bignum/assembly";
import { Protostone } from "protorune/assembly/indexer/Protostone";

export class NumberingProtostone extends Protostone {
  public ranges: BSTU128;
  _setRanges(ranges: BSTU128): NumberingProtostone {
    this.ranges = ranges;
    return this;
  }
  constructor(
    fields: Map<u64, Array<u128>>,
    edicts: Array<StaticArray<u128>>,
    protocolTag: u128,
  ) {
    super(fields, edicts, protocolTag);
    this.ranges = changetype<BSTU128>(0);
  }
  asProtostone(): Protostone {
    return changetype<Protostone>(this);
  }
  static fromProtostoneAndRanges(
    protostone: Protostone,
    ranges: BSTU128,
  ): NumberingProtostone {
    return new NumberingProtostone(
      protostone.fields,
      protostone.edicts,
      protostone.protocolTag,
    )._setRanges(ranges);
  }
  static from<T>(v: T): NumberingProtostone {
    return changetype<NumberingProtostone>(v);
  }
}
