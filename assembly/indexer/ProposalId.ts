import { IndexPointer } from "metashrew-as/assembly/indexer/tables";

export class ProposalId {
  public height: u64;
  public txindex: u32;
  constructor(height: u64, txindex: u32) {
    this.height = height;
    this.txindex = txindex;
  }
  static from(height: u64, txindex: u32): ProposalId {
    return new ProposalId(height, txindex);
  }
  serialize(): ArrayBuffer {
    return IndexPointer.wrap(new ArrayBuffer(0))
      .selectValue<u64>(this.height)
      .selectValue<u32>(this.txindex)
      .unwrap();
  }
}
