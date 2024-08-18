// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies
// @generated from protobuf file "quorum.proto" (package "quorum", syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
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
}
// @generated message type with reflection information, may provide speed optimized methods
class Range$Type extends MessageType<Range> {
    constructor() {
        super("quorum.Range", [
            { no: 1, name: "start", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "end", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<Range>): Range {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.start = new Uint8Array(0);
        message.end = new Uint8Array(0);
        if (value !== undefined)
            reflectionMergePartial<Range>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Range): Range {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes start */ 1:
                    message.start = reader.bytes();
                    break;
                case /* bytes end */ 2:
                    message.end = reader.bytes();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: Range, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes start = 1; */
        if (message.start.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.start);
        /* bytes end = 2; */
        if (message.end.length)
            writer.tag(2, WireType.LengthDelimited).bytes(message.end);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message quorum.Range
 */
export const Range = new Range$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RangeResult$Type extends MessageType<RangeResult> {
    constructor() {
        super("quorum.RangeResult", [
            { no: 1, name: "ranges", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Range }
        ]);
    }
    create(value?: PartialMessage<RangeResult>): RangeResult {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.ranges = [];
        if (value !== undefined)
            reflectionMergePartial<RangeResult>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RangeResult): RangeResult {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated quorum.Range ranges */ 1:
                    message.ranges.push(Range.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: RangeResult, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated quorum.Range ranges = 1; */
        for (let i = 0; i < message.ranges.length; i++)
            Range.internalBinaryWrite(message.ranges[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message quorum.RangeResult
 */
export const RangeResult = new RangeResult$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RuneRange$Type extends MessageType<RuneRange> {
    constructor() {
        super("quorum.RuneRange", [
            { no: 1, name: "totalSupply", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "ranges", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => RangeResult }
        ]);
    }
    create(value?: PartialMessage<RuneRange>): RuneRange {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.totalSupply = new Uint8Array(0);
        message.ranges = [];
        if (value !== undefined)
            reflectionMergePartial<RuneRange>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RuneRange): RuneRange {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes totalSupply */ 1:
                    message.totalSupply = reader.bytes();
                    break;
                case /* repeated quorum.RangeResult ranges */ 2:
                    message.ranges.push(RangeResult.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: RuneRange, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes totalSupply = 1; */
        if (message.totalSupply.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.totalSupply);
        /* repeated quorum.RangeResult ranges = 2; */
        for (let i = 0; i < message.ranges.length; i++)
            RangeResult.internalBinaryWrite(message.ranges[i], writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message quorum.RuneRange
 */
export const RuneRange = new RuneRange$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RuneRangeInput$Type extends MessageType<RuneRangeInput> {
    constructor() {
        super("quorum.RuneRangeInput", [
            { no: 1, name: "outpoints", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Outpoint },
            { no: 2, name: "rune", kind: "message", T: () => RuneId }
        ]);
    }
    create(value?: PartialMessage<RuneRangeInput>): RuneRangeInput {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.outpoints = [];
        if (value !== undefined)
            reflectionMergePartial<RuneRangeInput>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RuneRangeInput): RuneRangeInput {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated protorune.Outpoint outpoints */ 1:
                    message.outpoints.push(Outpoint.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* protorune.RuneId rune */ 2:
                    message.rune = RuneId.internalBinaryRead(reader, reader.uint32(), options, message.rune);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: RuneRangeInput, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated protorune.Outpoint outpoints = 1; */
        for (let i = 0; i < message.outpoints.length; i++)
            Outpoint.internalBinaryWrite(message.outpoints[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* protorune.RuneId rune = 2; */
        if (message.rune)
            RuneId.internalBinaryWrite(message.rune, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message quorum.RuneRangeInput
 */
export const RuneRangeInput = new RuneRangeInput$Type();
