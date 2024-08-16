import { input } from "metashrew-as/assembly/indexer";
import { quorum, protorune } from "./proto/quorum";
import { RuneId } from "metashrew-runes/assembly/indexer/RuneId";
import { logArray, totalSupply } from "./utils";
import { console } from "metashrew-as/assembly/utils";
import { OutPoint } from "metashrew-as/assembly/blockdata";
import { OUTPOINT_TO_RUNE_RANGES, RUNE_TO_OUTPOINT } from "./tables";
import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
import { pointsFromKeys } from "./indexer/numbering";
import { Box } from "metashrew-as/assembly/utils/box";
import { u128 } from "as-bignum/assembly";
import {
  fromArrayBuffer,
  min,
  toArrayBuffer,
} from "metashrew-runes/assembly/utils";

class PointsReduce {
  tree: BSTU128;
  distances: u128;
  limit: u128;
  constructor(tree: BSTU128, limit: u128) {
    this.tree = tree;
    this.distances = u128.from(0);
    this.limit = limit;
  }
  static from(tree: BSTU128, limit: u128): PointsReduce {
    return new PointsReduce(tree, limit);
  }
}

class OutpointReduce {
  ranges: Array<quorum.Range> = new Array<quorum.Range>();
  rune: RuneId;

  constructor(rune: protorune.RuneId) {
    this.rune = new RuneId(<u64>rune.height, rune.txindex);
  }
}

export function runerange(): ArrayBuffer {
  const inp = quorum.RuneRangeInput.decode(input().slice(4));
  const ranges = inp.outpoints.reduce<OutpointReduce>(
    (reducer: OutpointReduce, o: protorune.Outpoint) => {
      const outpoint = OutPoint.from(
        changetype<Uint8Array>(o.txid).buffer,
        o.vout,
      );
      const tree = BSTU128.at(RUNE_TO_OUTPOINT.select(reducer.rune.toBytes()));
      const points = pointsFromKeys(reducer.rune.toBytes(), [
        outpoint.toArrayBuffer(),
      ]);
      if (points.length == 0) return reducer;

      const point = points[0];
      const limit = totalSupply(reducer.rune);
      const distance = min(tree.seekGreater(point), limit);
      const range = new quorum.Range();
      range.start = point.toBytes(true);
      range.end = distance.toBytes(true);
      reducer.ranges.push(range);
      return reducer;
    },
    new OutpointReduce(inp.rune),
  ).ranges;

  const result = new quorum.RuneRange();
  result.ranges = ranges;
  return result.encode();
}
