import { _flush, input } from "metashrew-as/assembly/indexer/index";
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
import { u128 } from "as-bignum/assembly";
import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
import { Protorune } from "protorune/assembly/indexer";
import { decodeHex } from "metashrew-as/assembly";
import { RunestoneMessage } from "metashrew-runes/assembly/indexer/RunestoneMessage";
import { Index as SpendablesIndex } from "metashrew-spendables/assembly/indexer";
import { MessageContext } from "protorune/assembly/indexer/protomessage/MessageContext";
import { IncomingRune } from "protorune/assembly/indexer/protomessage/IncomingRune";
import { Inscription } from "metashrew-as/assembly/blockdata/inscription";
import {
  QUORUM_GENESIS_PROTORUNE_HEIGHT,
  QUORUM_GENESIS_PROTORUNE_TXINDEX
} from "./constants";
import {
  PROPOSALS
} from "./tables";
export * from "protorune/assembly/view";
export * from "./view";


function isGenesisProtorune(rune: IncomingRune): boolean {
  if (rune.runeId.block === QUORUM_GENESIS_PROTORUNE_HEIGHT && rune.runeId.tx === QUORUM_GENESIS_PROTORUNE_TXINDEX) return true;
  return false;
}

function findIncomingGenesisProtorune(runes: Array<IncomingRune>): IncomingRune {
  for (let i = 0; i < runes.length; i++) {
    const rune = runes[i];
    if (isGenesisProtorune(rune)) return rune;
  }
  return changetype<IncomingRune>(0);
}

class QuorumField {
  static PROPOSAL: u64 = 95;
  static VOTE: u64 = 97
}

function findInscription(ins: Array<Input>): Inscription {
  for (let i = 0; i < ins.length; i++) {
    const input = ins[i];
    const inscription = input.inscription();
    if (inscription !== null) return inscription as Inscription;
  }
  return changetype<Inscription>(0);
}


class ProposalId {
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
    return IndexPointer.wrap(new ArrayBuffer(0)).selectValue<u64>(this.height).selectValue<u32>(this.txindex).unwrap();
  }
}

class Proposal {
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

class QuorumMessageContext extends MessageContext {
  static PROPOSAL_PREFIX: ArrayBuffer = decodeHex('51554f52554de280a247454e45534953e280a250524f544f52554e452050726f706f73616c3a0a');
  protocolTag(): u128 {
    return u128.from(20000024);
  }
  proposal(): ArrayBuffer {
    const inscription = findInscription(this.transaction.ins);
    if (changetype<usize>(inscription) === 0) return changetype<ArrayBuffer>(0);
    const body = inscription.body();
    if (changetype<usize>(body) === 0) return changetype<ArrayBuffer>(0);
    if (memory.compare(changetype<usize>(body), changetype<usize>(QuorumMessageContext.PROPOSAL_PREFIX), <usize>QuorumMessageContext.PROPOSAL_PREFIX.byteLength) === 0) return Box.from(body).shrinkFront(QuorumMessageContext.PROPOSAL_PREFIX.byteLength).toArrayBuffer();
    return changetype<ArrayBuffer>(0);
  }
  handle(): boolean {
    const action = RunestoneMessage.parse(this.calldata);
    if (action.fields.has(QuorumField.PROPOSAL)) {
      const incomingGenesis: IncomingRune = findIncomingGenesisProtorune(this.runes);
      if (changetype<usize>(incomingGenesis) === 0) return false;
      if (incomingGenesis.amount < (u128).from(10000)) return false;
      const proposal = this.proposal();
      if (changetype<usize>(proposal) === 0) return false;
      const payload = action.fields.get(QuorumField.PROPOSAL);
      if (payload.length !== 2) return false;
      Proposal.from(this.height, this.txindex, payload, proposal).save(PROPOSALS);
    } else if (action.fields.has(QuorumField.VOTE)) {
      /* TODO: implement votes */
    }
    return true;
  }
}

export function _start(): void {
  const data = Box.from(input());
  const height = parsePrimitive<u32>(data);
  const block = new Block(data);
  SpendablesIndex.indexBlock(height, block);
  new Protorune<QuorumMessageContext>().indexBlock(height, block);
  _flush();
}
