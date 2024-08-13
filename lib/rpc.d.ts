import { RuneOutput } from "metashrew-runes/lib/src.ts/outpoint";
import { ProtorunesRpc } from "protorune/lib/rpc";
export declare class QuorumRpc extends ProtorunesRpc {
    runerange({ outpoint, runeId }: any): Promise<{
        balances: RuneOutput[];
    }>;
}
