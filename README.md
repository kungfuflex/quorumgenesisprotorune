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

The calldata sent with a protomessage for QUORUM•GENESIS•PROTORUNE is encoded as a `leb128[]`. Each individual field in these structures are encoded as leb128 and decoded in the order defined here, where `QuorumField` corresponds to the Tag value for the Runestone data structure being recursively encoded.

```proto
enum QuorumField {
  PROPOSAL = 95;
  VOTE = 97;
}

message ProposalPayload {
  ProposalId header = 1;
  uint64 quorumWeight = 2;
  uint64 quorumHeight = 3;
}

message Vote {
  ProposalId proposal = 1;
  uint32 voteIndex = 2;
}

```

All messages have no variability in their outputs or settlement risk so we do not use a predicate.

Anyone with at least 10,000 QUORUM•GENESIS•PROTORUNE can create a proposal. To create the proposal, a protorune RunestoneMessage edict should spend QUORUM•GENESIS•PROTORUNE as well as a text based inscription reveal beginning with the text "QUORUM•GENESIS•PROTORUNE Proposal:\n" to a protomessage with calldata set to a Runestone encoded structure defined below:

```rs
struct QuorumRunestone {
  [Proposal (95)]: ProposalPayload;
  [Vote (97)]: u32;
}
```

The pointer in the protomessage points to the output which will hold vote protorunes which are created 1:1 for the amount of QUORUM•GENESIS•PROTORUNE spent. The refund_pointer will contain the input QUORUM•GENESIS•PROTORUNE spent to the protomessage.

Vote tokens can be transferred as part of a Protostone where the u128 for what would normally represent the txindex actually will store the two u32 values concatenated { txindex, voteIndex } to a u64 value then packed with leb128 as usual.

Proposals are considered to have reached quorum and execute when the total supply of vote tokens >= quorumWeight OR the block height reaches quorumHeight. The resolution of a proposal is measured in terms of the total supply of the vote token for each possible voteIndex in choices.

Vote tokens can be only be minted with QUORUM•GENESIS•PROTORUNE 1:1 and the same ranges of QUORUM•GENESIS•PROTORUNE cannot be used to mint vote tokens more than once per range on the same proposal. For this we must index rune ranges to ensure that each smallest unit of the rune is indexed. Vote tokens can be output to a delegated entity, and vote tokens can also be exchanged for a different vote by transferring to a protomessage with Vote.

It is possible to withdraw a vote by transferring vote tokens to an unspendable output.

## Author

Freetoshi Vote-o-moko
