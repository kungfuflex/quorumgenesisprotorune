import { decodeRunes } from "metashrew-runes/lib/src.ts/outpoint";
import { RuneRangeInput } from "./proto/quorum";
import { stripHexPrefix } from "protorune/lib/utils";

function numberToBytes(num: bigint): Uint8Array {
  const buf = Buffer.from(num.toString(), "utf-8");
  const bytes = Uint8Array.from(buf);
  return bytes;
}

export function encodeRuneRangeInput(
  outpoint: { tx: string; vout: number },
  runeId: { height: number; txindex: number },
) {
  const input: RuneRangeInput = {
    outpoint: {
      txid: Buffer.from(outpoint.tx, "hex"),
      vout: outpoint.vout,
    },
    rune: runeId,
  };
  return "0x" + Buffer.from(RuneRangeInput.toBinary(input)).toString("hex");
}

export function decodeRuneRangeOutput(out: String) {
  return Buffer.from(out);
}
