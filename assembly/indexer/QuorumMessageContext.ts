import { decodeHex } from "metashrew-as/assembly";
import { PROPOSALS } from "../tables";
import {
  QUORUM_GENESIS_PROTORUNE_HEIGHT,
  QUORUM_GENESIS_PROTORUNE_TXINDEX,
} from "../constants";
import { Inscription } from "metashrew-as/assembly/blockdata/inscription";
import {
  Transaction,
  Input,
  Output,
  OutPoint,
} from "metashrew-as/assembly/blockdata/transaction";
import { MessageContext } from "protorune/assembly/indexer/protomessage/MessageContext";
import { IncomingRune } from "protorune/assembly/indexer/protomessage/IncomingRune";
import { RunestoneMessage } from "metashrew-runes/assembly/indexer/RunestoneMessage";
import { QuorumField } from "./fields/QuorumField";
import { Proposal } from "./Proposal";
import { Box } from "metashrew-as/assembly/utils/box";
import { u128 } from "as-bignum/assembly";
import { console } from "metashrew-as/assembly/utils";

function isGenesisProtorune(rune: IncomingRune): boolean {
  if (
    rune.runeId.block === u128.from(QUORUM_GENESIS_PROTORUNE_HEIGHT) &&
    rune.runeId.tx === u128.from(QUORUM_GENESIS_PROTORUNE_TXINDEX)
  )
    return true;
  return false;
}

function findIncomingGenesisProtorune(
  runes: Array<IncomingRune>,
): IncomingRune {
  for (let i = 0; i < runes.length; i++) {
    const rune = runes[i];
    if (isGenesisProtorune(rune)) return rune;
  }
  return changetype<IncomingRune>(0);
}
export function findInscription(ins: Array<Input>): Inscription {
  for (let i = 0; i < ins.length; i++) {
    const input = ins[i];
    const inscription = input.inscription();
    if (inscription !== null) return inscription as Inscription;
  }
  return changetype<Inscription>(0);
}

export class QuorumMessageContext extends MessageContext {
  static PROPOSAL_PREFIX: ArrayBuffer = decodeHex(
    "51554f52554de280a247454e45534953e280a250524f544f52554e452050726f706f73616c3a0a",
  );
  @inline
  protocolTag(): u128 {
    const tag = u128.from("20000024");
    console.log(tag.toString());
    return tag;
  }
  proposal(): ArrayBuffer {
    const inscription = findInscription(this.transaction.ins);
    if (changetype<usize>(inscription) === 0) return changetype<ArrayBuffer>(0);
    const body = inscription.body();
    if (changetype<usize>(body) === 0) return changetype<ArrayBuffer>(0);
    if (
      body != null &&
      memory.compare(
        changetype<usize>(body),
        changetype<usize>(QuorumMessageContext.PROPOSAL_PREFIX),
        <usize>QuorumMessageContext.PROPOSAL_PREFIX.byteLength,
      ) === 0
    )
      return Box.from(body)
        .shrinkFront(QuorumMessageContext.PROPOSAL_PREFIX.byteLength)
        .toArrayBuffer();
    return changetype<ArrayBuffer>(0);
  }
  proposalMinimum(): u128 {
    return u128.from(10000);
  }
  handle(): boolean {
    const action = RunestoneMessage.parse(this.calldata);
    if (action.fields.has(QuorumField.PROPOSAL)) {
      const incomingGenesis: IncomingRune = findIncomingGenesisProtorune(
        this.runes,
      );
      if (changetype<usize>(incomingGenesis) === 0) return false;
      if (incomingGenesis.amount < this.proposalMinimum()) return false;
      const proposal = this.proposal();
      if (changetype<usize>(proposal) === 0) return false;
      const payload = action.fields.get(QuorumField.PROPOSAL);
      if (payload.length !== 2) return false;
      Proposal.from(this.height, this.txindex, payload, proposal).save(
        PROPOSALS,
      );
    } else if (action.fields.has(QuorumField.VOTE)) {
      /* TODO: implement votes */
    }
    return true;
  }
}
