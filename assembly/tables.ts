import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
export const PROPOSALS = IndexPointer.for("/proposals/");
export const RUNE_TO_OUTPOINT = BSTU128.at(IndexPointer.for("/rune-ranges/"));