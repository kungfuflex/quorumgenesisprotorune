import { _flush, input } from "metashrew-as/assembly/indexer/index";
import { Block } from "metashrew-as/assembly/blockdata/block";
import { parsePrimitive } from "metashrew-as/assembly/utils/utils";
import { Index as SpendablesIndex } from "metashrew-spendables/assembly/indexer";
import { GenesisProtoruneIndex } from "./indexer/GenesisProtoruneIndex";
export * from "protorune/assembly/view";
export * from "./view";


export function _start(): void {
  const data = Box.from(input());
  const height = parsePrimitive<u32>(data);
  const block = new Block(data);
  SpendablesIndex.indexBlock(height, block);
  new GenesisProtoruneIndex().indexBlock(height, block);
  _flush();
}
