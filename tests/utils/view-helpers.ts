//@ts-ignore
import { IndexerProgram, readArrayBufferAsHex } from "metashrew-test";
import { QuorumRpc } from "../../src.ts/rpc";

export const runerange = async (
  program: IndexerProgram,
  outpoints: {
    tx: string;
    vout: number;
  }[],
  runeId: {
    height: number;
    txindex: number;
  },
  protocolId?: bigint,
): Promise<any> => {
  const cloned = program; // just mutate it
  const result = await QuorumRpc.prototype.runerange.call(
    {
      async _call({ input }) {
        cloned.setBlock(input);
        const ptr = await cloned.run("runerange");
        return readArrayBufferAsHex(cloned.memory, ptr);
      },
    },
    { outpoints, runeId, protocolId },
  );
  return result;
};
