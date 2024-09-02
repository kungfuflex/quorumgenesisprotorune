"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuorumRpc = void 0;
const quorumwallet = __importStar(require("./wallet"));
const rpc_1 = require("protorune/lib/src.ts/rpc");
const addHexPrefix = (s) => (s.substr(0, 2) === "0x" ? s : "0x" + s);
let id = 0;
class QuorumRpc extends rpc_1.ProtorunesRpc {
    async runerange({ outpoints, runeId, protocolId }) {
        const buffer = quorumwallet.encodeRuneRangeInput(outpoints, runeId, protocolId);
        const byteString = await this._call({
            method: "runerange",
            input: buffer,
        });
        const decoded = quorumwallet.decodeRuneRangeOutput(byteString);
        return decoded;
    }
}
exports.QuorumRpc = QuorumRpc;
//# sourceMappingURL=rpc.js.map