import { RuneOutput } from "metashrew-runes/lib/src.ts/outpoint";
import { ProtorunesRpc } from "protorune/lib/src.ts/rpc";
export declare class QuorumRpc extends ProtorunesRpc {
    runerange({ outpoints, runeId, protocolId }: any): Promise<{
        balances: RuneOutput[];
    }>;
}
