"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRuneRangeInput = encodeRuneRangeInput;
exports.decodeRuneRangeOutput = decodeRuneRangeOutput;
const quorum_1 = require("./proto/quorum");
const utils_1 = require("protorune/lib/src.ts/utils");
function numberToBytes(num) {
    const buf = Buffer.from(num.toString(), "utf-8");
    const bytes = Uint8Array.from(buf);
    return bytes;
}
function encodeRuneRangeInput(outpoints, runeId, protocolId = BigInt(13)) {
    const input = {
        outpoints: outpoints.map((outpoint) => ({
            txid: Buffer.from(outpoint.tx, "hex"),
            vout: outpoint.vout,
        })),
        rune: runeId,
        protocolId: Buffer.from(protocolId.toString(), "utf-8"),
    };
    return "0x" + Buffer.from(quorum_1.RuneRangeInput.toBinary(input)).toString("hex");
}
function decodeRuneRangeOutput(hex) {
    const result = quorum_1.RuneRange.fromBinary(Buffer.from((0, utils_1.stripHexPrefix)(hex), "hex"));
    const { ranges: completeRanges } = result;
    const res = completeRanges.map((ranges) => ranges.ranges.map((range) => ({
        start: BigInt("0x" + Buffer.from(range.start).toString("hex")),
        end: BigInt("0x" + Buffer.from(range.end).toString("hex")),
    })));
    return res;
}
//# sourceMappingURL=wallet.js.map