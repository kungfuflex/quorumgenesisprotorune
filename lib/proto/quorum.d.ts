import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { RuneId } from "./protorune";
import { Outpoint } from "./protorune";
/**
 * @generated from protobuf message quorum.RuneRange
 */
export interface RuneRange {
    /**
     * @generated from protobuf field: bytes totalSupply = 1;
     */
    totalSupply: Uint8Array;
}
/**
 * @generated from protobuf message quorum.RuneRangeInput
 */
export interface RuneRangeInput {
    /**
     * @generated from protobuf field: protorune.Outpoint outpoint = 1;
     */
    outpoint?: Outpoint;
    /**
     * @generated from protobuf field: protorune.RuneId rune = 2;
     */
    rune?: RuneId;
}
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
