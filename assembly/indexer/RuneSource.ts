import { u128 } from "as-bignum/assembly";
import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
import { Source } from "as-rangesink/assembly/rangesink";

export class RuneSource extends Source<u128, BSTU128> {}
