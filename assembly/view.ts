import { input } from "metashrew-as/assembly/indexer";
import { quorum } from "./proto/quorum";
import { RuneId } from "metashrew-runes/assembly/indexer/RuneId";
import { logArray, totalSupply } from "./utils";
import { console } from "metashrew-as/assembly/utils";
import { OutPoint } from "metashrew-as/assembly/blockdata";
import { OUTPOINT_TO_RUNE_RANGES, RUNE_TO_OUTPOINT } from "./tables";
import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
import { pointsFromKeys } from "./indexer/numbering";
import { Box } from "metashrew-as/assembly/utils/box";

export function runerange(): ArrayBuffer {
  console.log("runeranges");
  const inp = quorum.RuneRangeInput.decode(input().slice(4));
  const outpoint = OutPoint.from(
    changetype<Uint8Array>(inp.outpoint.txid).buffer,
    0,
  );
  console.log(inp.rune.height.toString() + " " + inp.rune.txindex.toString());

  const rune = new RuneId(<u64>inp.rune.height, inp.rune.txindex);
  const op = BSTU128.at(RUNE_TO_OUTPOINT.select(rune.toBytes()));
  const table = OUTPOINT_TO_RUNE_RANGES.select(rune.toBytes());
  const points = pointsFromKeys(rune.toBytes(), [outpoint.toArrayBuffer()]);
  console.log(Box.from(outpoint.toArrayBuffer()).toHexString());

  logArray(points);

  const result = new quorum.RuneRange();
  return result.encode();
}
