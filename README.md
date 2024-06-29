# QUORUM•GENESIS•PROTORUNE

This repository should serve as the design document for a governance framework and associated WASM indexer program, with proposals, voting, and delegation thereof, on Bitcoin L1.

This subprotocol is an example of a protorune indexer and, in fact, defines the utility of the genesis protorune, for which this repository is named.

## Indexer

The supply of QUORUM•GENESIS•PROTORUNE is ordered in its individual units in the same manner as satoshis with respect to ordinals theory. In fact, if we apply ordinals theory to runes, it gives us a concept of uniqueness for a given spend of assets. This way, we can spend QUORUM•GENESIS•PROTORUNE to a protomessage which refunds us back our input runes and outputs an equivalent quantity of vote tokens, the vote they model determined by the calldata of the protomessage used to vote.

Vote tokens can only be generated once per unit of QUORUM•GENESIS•PROTORUNE per proposal, and are tracked in terms of the ProposalId.

```proto
message ProposalId {
  uint64 height = 1;
  uint32 txindex = 2;
}
```

A protomessage for QUORUM•GENESIS•PROTORUNE is of the standard structure:

```proto
message ProtoMessage {
  bytes calldata = 1;
  Predicate predicate = 2;
  uint32 pointer = 3;
  uint32 refund_pointer = 4;
}
```

All messages have no variability in their outputs or settlement risk so a predicate can be an empty set.

Calldata for a ProtoMessage is of the structure:

```proto
message QuorumProtoMessage {
  oneof data {
    Proposal proposal = 1;
    Vote vote = 2;
  }
}
```

The substructures are defined later in this section.

Anyone with at least 10,000 QUORUM•GENESIS•PROTORUNE can create a proposal. To create the proposal, a protorune RunestoneMessage edict should spend QUORUM•GENESIS•PROTORUNE as well as a text based inscription reveal beginning with the text "QUORUM•GENESIS•PROTORUNE Proposal:\n" to a protomessage with calldata of the oneof structure being:

```proto
message Proposal {
  uint64 quorumHeight = 1;
  uint64 quorumWeight = 2;
  repeated string choices = 3;
  uint32 voteIndex = 4;
}
```

To vote on a proposal, spend QUORUM•GENESIS•PROTORUNE to a protomessage of the form:

```proto
message Vote {
  ProposalId proposal = 1;
  uint32 voteIndex = 2;
}
```

The pointer in the protomessage points to the output which will hoold vote protorunes which are created 1:1 for the amount of QUORUM•GENESIS•PROTORUNE spent. The refund_pointer will contain the input QUORUM•GENESIS•PROTORUNE spent to the protomessage.

Vote tokens can be transferred as part of a ProtoRunestoneMessage where the u128 for what would normally represent the txindex actually will store the two u32 values concatenated { txindex, voteIndex } to a u64 value then packed with leb128 as usual.

Proposals are considered to have reached quorum and execute when the total supply of vote tokens >= quorumWeight OR the block height reaches quorumHeight. The resolution of a proposal is measured in terms of the total supply of the vote token for each possible voteIndex in choices.

Vote tokens can be only be minted with QUORUM•GENESIS•PROTORUNE 1:1 and the same ranges of QUORUM•GENESIS•PROTORUNE cannot be used to mint vote tokens more than once per range on the same proposal. For this we must index rune ranges to ensure that each smallest unit of the rune is indexed. Vote tokens can be output to a delegated entity, and vote tokens can also be exchanged for a different vote by transferring to a protomessage with Vote.

It is possible to withdraw a vote by transferring vote tokens to an unspendable output.

## Author

Freetoshi Vote-o-moko
