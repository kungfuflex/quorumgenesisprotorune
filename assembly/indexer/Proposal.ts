import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { u128 } from "as-bignum/assembly";
import { ProposalId } from "./ProposalId";

export class Proposal {
  public proposalId: ProposalId;
  public quorumHeight: u64;
  public quorumWeight: u64;
  public body: ArrayBuffer;
  constructor(proposalId: ProposalId, quorumHeight: u64, quorumWeight: u64, body: ArrayBuffer) {
    this.quorumHeight = quorumHeight;
    this.quorumWeight = quorumWeight;
    this.body = body;
    this.proposalId = proposalId;
  }

  save(ptr: IndexPointer): void {
    const id = this.proposalId.serialize();
    const proposalPointer = ptr.select(id);
    const exists = proposalPointer.keyword("/quorum-height").get().byteLength !== 0;
    proposalPointer.keyword("/quorum-height").setValue<u64>(this.quorumHeight);
    proposalPointer.keyword("/quorum-weight").setValue<u64>(this.quorumWeight);
    proposalPointer.keyword("/content").set(this.body);
    if (!exists) {
      ptr.append(id);
    }
  }
  static from(height: u64, txindex: u32, field: Array<u128>, body: ArrayBuffer): Proposal {
    if (field.length < 2) {
      return changetype<Proposal>(0);
    }
    const proposalId = ProposalId.from(height, txindex);
    return new Proposal(proposalId, field[0].toU64(), field[1].toU32(), body);
  }
}
