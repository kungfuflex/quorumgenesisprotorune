"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuneRangeInput = exports.RuneRange = exports.RangeResult = exports.Range = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const protorune_1 = require("./protorune");
const protorune_2 = require("./protorune");
// @generated message type with reflection information, may provide speed optimized methods
class Range$Type extends runtime_4.MessageType {
    constructor() {
        super("quorum.Range", [
            { no: 1, name: "start", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "end", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.start = new Uint8Array(0);
        message.end = new Uint8Array(0);
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
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
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* bytes start = 1; */
        if (message.start.length)
            writer.tag(1, runtime_1.WireType.LengthDelimited).bytes(message.start);
        /* bytes end = 2; */
        if (message.end.length)
            writer.tag(2, runtime_1.WireType.LengthDelimited).bytes(message.end);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message quorum.Range
 */
exports.Range = new Range$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RangeResult$Type extends runtime_4.MessageType {
    constructor() {
        super("quorum.RangeResult", [
            { no: 1, name: "ranges", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => exports.Range }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.ranges = [];
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated quorum.Range ranges */ 1:
                    message.ranges.push(exports.Range.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* repeated quorum.Range ranges = 1; */
        for (let i = 0; i < message.ranges.length; i++)
            exports.Range.internalBinaryWrite(message.ranges[i], writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message quorum.RangeResult
 */
exports.RangeResult = new RangeResult$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RuneRange$Type extends runtime_4.MessageType {
    constructor() {
        super("quorum.RuneRange", [
            { no: 1, name: "totalSupply", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "ranges", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => exports.RangeResult }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.totalSupply = new Uint8Array(0);
        message.ranges = [];
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes totalSupply */ 1:
                    message.totalSupply = reader.bytes();
                    break;
                case /* repeated quorum.RangeResult ranges */ 2:
                    message.ranges.push(exports.RangeResult.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* bytes totalSupply = 1; */
        if (message.totalSupply.length)
            writer.tag(1, runtime_1.WireType.LengthDelimited).bytes(message.totalSupply);
        /* repeated quorum.RangeResult ranges = 2; */
        for (let i = 0; i < message.ranges.length; i++)
            exports.RangeResult.internalBinaryWrite(message.ranges[i], writer.tag(2, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message quorum.RuneRange
 */
exports.RuneRange = new RuneRange$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RuneRangeInput$Type extends runtime_4.MessageType {
    constructor() {
        super("quorum.RuneRangeInput", [
            { no: 1, name: "outpoints", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => protorune_2.Outpoint },
            { no: 2, name: "rune", kind: "message", T: () => protorune_1.RuneId },
            { no: 3, name: "protocolId", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.outpoints = [];
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated protorune.Outpoint outpoints */ 1:
                    message.outpoints.push(protorune_2.Outpoint.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* protorune.RuneId rune */ 2:
                    message.rune = protorune_1.RuneId.internalBinaryRead(reader, reader.uint32(), options, message.rune);
                    break;
                case /* optional bytes protocolId */ 3:
                    message.protocolId = reader.bytes();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* repeated protorune.Outpoint outpoints = 1; */
        for (let i = 0; i < message.outpoints.length; i++)
            protorune_2.Outpoint.internalBinaryWrite(message.outpoints[i], writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protorune.RuneId rune = 2; */
        if (message.rune)
            protorune_1.RuneId.internalBinaryWrite(message.rune, writer.tag(2, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* optional bytes protocolId = 3; */
        if (message.protocolId !== undefined)
            writer.tag(3, runtime_1.WireType.LengthDelimited).bytes(message.protocolId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message quorum.RuneRangeInput
 */
exports.RuneRangeInput = new RuneRangeInput$Type();
//# sourceMappingURL=quorum.js.map