import { _flush, input, get, set } from "metashrew-as/assembly/indexer/index";
import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { Block } from "metashrew-as/assembly/blockdata/block";
import { parsePrimitive } from "metashrew-as/assembly/utils/utils";
import {
  Transaction,
  Input,
  Output,
  OutPoint,
} from "metashrew-as/assembly/blockdata/transaction";
import { console } from "metashrew-as/assembly/utils/logging";
import { u256, u128 } from "as-bignum/assembly";
import { quorum as protobuf } from "./proto/quorum";
import { BSTU128 } from "./quorum/widebst";
import { u128ToHex } from "./utils";

const QUORUM_GENESIS_PROTORUNE_HEIGHT = 849236;
const QUORUM_GENESIS_PROTORUNE_TXINDEX = 298;
/*

class QuorumMessage extends ProtoMessage {
  handle(context: MessageContext): boolean {
    const message = protobuf.QuorumProtoMessage.decode(context.calldata);
    message.data.
    const i = context.runes.findIndex((v: IncomingRune, i: i32, ary: Array<IncomingRune>) => v.runeId.height === 849236 && v.runeId.txindex === 298);
    i
  }
}
*/

export function test_BSTU128(): void {
  const bst = BSTU128.at(IndexPointer.for("/test"));
  u128.from(0x100);
  bst.set(u128.from(0x100), String.UTF8.encode("test"));
  bst.set(u128.from(0x140), String.UTF8.encode("test"));
  bst.set(u128.from(0x104), String.UTF8.encode("test"));
  console.log(u128ToHex(bst.seekGreater(u128.from(0x103))));
  bst.set(u128.from(0x104), new ArrayBuffer(0));
  console.log(u128ToHex(bst.seekGreater(u128.from(0x103))));
}
/*

export function _start(): void {
  const data = input();
  const box = Box.from(data);
  const height = parsePrimitive<u32>(box);
  if (height < GENESIS - 6) {
    _flush();
    return;
  }
  const block = new Block(box);
  if (height >= GENESIS) SpendablesIndex.indexBlock(height, block);
  Protorune.indexBlock<QuorumMessage>(height, block);
  _flush();
}
*/

export * from "./tests";
export * from "./view";
