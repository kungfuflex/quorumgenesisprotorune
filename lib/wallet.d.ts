export declare function encodeRuneRangeInput(outpoints: {
    tx: string;
    vout: number;
}[], runeId: {
    height: number;
    txindex: number;
}, protocolId?: bigint): string;
export declare function decodeRuneRangeOutput(hex: string): {
    start: bigint;
    end: bigint;
}[][];
