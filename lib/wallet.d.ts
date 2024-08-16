export declare function encodeRuneRangeInput(outpoint: {
    tx: string;
    vout: number;
}, runeId: {
    height: number;
    txindex: number;
}): string;
export declare function decodeRuneRangeOutput(hex: String): {
    start: bigint;
    end: bigint;
}[];
