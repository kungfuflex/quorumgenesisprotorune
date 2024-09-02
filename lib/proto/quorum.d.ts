import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { RuneId } from "./protorune";
import { Outpoint } from "./protorune";
/**
 * @generated from protobuf message quorum.Range
 */
export interface Range {
    /**
     * @generated from protobuf field: bytes start = 1;
     */
    start: Uint8Array;
    /**
     * @generated from protobuf field: bytes end = 2;
     */
    end: Uint8Array;
}
/**
 * @generated from protobuf message quorum.RangeResult
 */
export interface RangeResult {
    /**
     * @generated from protobuf field: repeated quorum.Range ranges = 1;
     */
    ranges: Range[];
}
/**
 * @generated from protobuf message quorum.RuneRange
 */
export interface RuneRange {
    /**
     * @generated from protobuf field: bytes totalSupply = 1;
     */
    totalSupply: Uint8Array;
    /**
     * @generated from protobuf field: repeated quorum.RangeResult ranges = 2;
     */
    ranges: RangeResult[];
}
/**
 * @generated from protobuf message quorum.RuneRangeInput
 */
export interface RuneRangeInput {
    /**
     * @generated from protobuf field: repeated protorune.Outpoint outpoints = 1;
     */
    outpoints: Outpoint[];
    /**
     * @generated from protobuf field: protorune.RuneId rune = 2;
     */
    rune?: RuneId;
    /**
     * @generated from protobuf field: optional bytes protocolId = 3;
     */
    protocolId?: Uint8Array;
}
declare class Range$Type extends MessageType<Range> {
    constructor();
    create(value?: PartialMessage<Range>): Range;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Range): Range;
    internalBinaryWrite(message: Range, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message quorum.Range
 */
export declare const Range: Range$Type;
declare class RangeResult$Type extends MessageType<RangeResult> {
    constructor();
    create(value?: PartialMessage<RangeResult>): RangeResult;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RangeResult): RangeResult;
    internalBinaryWrite(message: RangeResult, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message quorum.RangeResult
 */
export declare const RangeResult: RangeResult$Type;
declare class RuneRange$Type extends MessageType<RuneRange> {
    constructor();
    create(value?: PartialMessage<RuneRange>): RuneRange;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RuneRange): RuneRange;
    internalBinaryWrite(message: RuneRange, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message quorum.RuneRange
 */
export declare const RuneRange: RuneRange$Type;
declare class RuneRangeInput$Type extends MessageType<RuneRangeInput> {
    constructor();
    create(value?: PartialMessage<RuneRangeInput>): RuneRangeInput;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RuneRangeInput): RuneRangeInput;
    internalBinaryWrite(message: RuneRangeInput, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message quorum.RuneRangeInput
 */
export declare const RuneRangeInput: RuneRangeInput$Type;
export {};
