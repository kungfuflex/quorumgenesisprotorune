import { decodeRunes } from "metashrew-runes/lib/src.ts/outpoint";
import { RuneRangeInput, RuneRange } from "./proto/quorum";
import { u128 } from "@magiceden-oss/runestone-lib/dist/src/integer";
import { stripHexPrefix } from "protorune/lib/src.ts/utils";

function numberToBytes(num: bigint): Uint8Array {
  const buf = Buffer.from(num.toString(), "utf-8");
  const bytes = Uint8Array.from(buf);
  return bytes;
}

export function encodeRuneRangeInput(
  outpoints: { tx: string; vout: number }[],
  runeId: { height: number; txindex: number },
  protocolId: bigint = BigInt(13),
) {
  const input: RuneRangeInput = {
    outpoints: outpoints.map((outpoint) => ({
      txid: Buffer.from(outpoint.tx, "hex"),
      vout: outpoint.vout,
    })),
    rune: runeId,
    protocolId: Buffer.from(protocolId.toString(), "utf-8"),
  };
  return "0x" + Buffer.from(RuneRangeInput.toBinary(input)).toString("hex");
}

export function decodeRuneRangeOutput(hex: string) {
  const result = RuneRange.fromBinary(Buffer.from(stripHexPrefix(hex), "hex"));
  const { ranges: completeRanges } = result;
  const res = completeRanges.map((ranges) =>
    ranges.ranges.map((range) => ({
      start: BigInt("0x" + Buffer.from(range.start).toString("hex")),
      end: BigInt("0x" + Buffer.from(range.end).toString("hex")),
    })),
  );
  return res;
}
