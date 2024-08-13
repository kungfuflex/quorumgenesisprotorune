"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRuneRangeInput = encodeRuneRangeInput;
exports.decodeRuneRangeOutput = decodeRuneRangeOutput;
const quorum_1 = require("./proto/quorum");
function numberToBytes(num) {
    const buf = Buffer.from(num.toString(), "utf-8");
    const bytes = Uint8Array.from(buf);
    return bytes;
}
function encodeRuneRangeInput(outpoint, runeId) {
    const input = {
        outpoint: {
            txid: Buffer.from(outpoint.tx, "hex"),
            vout: outpoint.vout,
        },
        rune: runeId,
    };
    return "0x" + Buffer.from(quorum_1.RuneRangeInput.toBinary(input)).toString("hex");
}
function decodeRuneRangeOutput(out) {
    return Buffer.from(out);
}
//# sourceMappingURL=wallet.js.map