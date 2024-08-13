import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
export const PROPOSALS = IndexPointer.for("/proposals/");
export const RUNE_TO_OUTPOINT = IndexPointer.for("/outpoint/byrune");
export const OUTPOINT_TO_RUNE_RANGES = IndexPointer.for("/rune/byoutpoint");
