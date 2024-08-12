import { input } from "metashrew-as/assembly/indexer";
import { quorum } from "./proto/quorum";

export function runerange(): ArrayBuffer {
  const inp = quorum.RuneRangeInput.decode(input().slice(4));
  const outpoint = inp.outpoint;
  return changetype<ArrayBuffer>(0);
}
