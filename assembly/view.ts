import { input } from "metashrew-as/assembly/indexer";
import { quorum } from "./proto/quorum";
import { RuneId } from "metashrew-runes/assembly/indexer/RuneId";
import { totalSupply } from "./indexer/numbering";
import { console } from "metashrew-as/assembly/utils";

export function runerange(): ArrayBuffer {
  const inp = quorum.RuneRangeInput.decode(input().slice(4));
  const outpoint = inp.outpoint;
  console.log(inp.rune.height.toString() + " " + inp.rune.txindex.toString());
  const rune = new RuneId(<u64>inp.rune.height, inp.rune.txindex);

  const result = new quorum.RuneRange();
  return result.encode();
}
