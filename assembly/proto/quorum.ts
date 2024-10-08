namespace __proto {
  export const MAX_POS = 0x1000;

  /**
   * Decoder implements protobuf message decode interface.
   *
   * Useful references:
   *
   * Protocol Buffer encoding: https://developers.google.com/protocol-buffers/docs/encoding
   * LEB128 encoding AKA varint 128 encoding: https://en.wikipedia.org/wiki/LEB128
   * ZigZag encoding/decoding (s32/s64): https://gist.github.com/mfuerstenau/ba870a29e16536fdbaba
   */
  export class Decoder {
    public view: DataView;
    public pos: i32;

    constructor(view: DataView) {
      this.view = view;
      this.pos = 0;
    }

    /**
     * Returns true if current reader has reached the buffer end
     * @returns True if current reader has reached the buffer end
     */
    @inline
    eof(): bool {
      return this.pos >= this.view.byteLength;
    }

    /**
     * Returns current buffer length in bytes
     * @returns Length in bytes
     */
    @inline
    get byteLength(): i32 {
      return this.view.byteLength;
    }

    /**
     * An alias method to fetch tag from the reader. Supposed to return tuple of [field number, wire_type].
     * TODO: Replace with return tuple when tuples become implemented in AS.
     * @returns Message tag value
     */
    @inline
    tag(): u32 {
      return this.uint32();
    }

    /**
     * Returns byte at offset, alias for getUint8
     * @param byteOffset Offset
     * @returns u8
     */
    @inline
    private u8at(byteOffset: i32): u8 {
      return this.view.getUint8(byteOffset);
    }

    /**
     * Reads and returns varint number (128 + 10 bits max) from a current position.
     * @returns Returns varint
     */
    varint(): u64 {
      let value: u64;

      // u32
      value = (u64(u8(this.u8at(this.pos))) & 127) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 7)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 14)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 21)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      // u32 remainder or u64 byte
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 28)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      // u64
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 35)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value =
        (value | ((u64(u8(this.u8at(this.pos))) & 127) << 42)) /* 42!!! */ >>>
        0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 49)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 28)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      // u64 remainder
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 35)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;

      if (this.pos > this.byteLength) {
        this.throwOutOfRange();
      }

      return value;
    }

    @inline
    int32(): i32 {
      return i32(this.varint());
    }

    @inline
    int64(): i64 {
      return i32(this.varint());
    }

    @inline
    uint32(): u32 {
      return u32(this.varint());
    }

    @inline
    uint64(): u64 {
      return u64(this.varint());
    }

    @inline
    sint32(): i32 {
      const n: u64 = this.varint();
      return i32((n >>> 1) ^ -(n & 1));
    }

    @inline
    sint64(): i64 {
      const n: u64 = this.varint();
      return i64((n >>> 1) ^ -(n & 1));
    }

    fixed32(): u32 {
      this.pos += 4;
      if (this.pos > this.byteLength) {
        this.throwOutOfRange();
      }

      // u32(u8) ensures that u8(-1) becomes u32(4294967295) instead of u8(255)
      return (
        u32(u8(this.u8at(this.pos - 4))) |
        (u32(u8(this.u8at(this.pos - 3))) << 8) |
        (u32(u8(this.u8at(this.pos - 2))) << 16) |
        (u32(u8(this.u8at(this.pos - 1))) << 24)
      );
    }

    @inline
    sfixed32(): i32 {
      return i32(this.fixed32());
    }

    fixed64(): u64 {
      this.pos += 8;
      if (this.pos > this.byteLength) {
        this.throwOutOfRange();
      }

      return (
        u64(u8(this.u8at(this.pos - 8))) |
        (u64(u8(this.u8at(this.pos - 7))) << 8) |
        (u64(u8(this.u8at(this.pos - 6))) << 16) |
        (u64(u8(this.u8at(this.pos - 5))) << 24) |
        (u64(u8(this.u8at(this.pos - 4))) << 32) |
        (u64(u8(this.u8at(this.pos - 3))) << 40) |
        (u64(u8(this.u8at(this.pos - 2))) << 48) |
        (u64(u8(this.u8at(this.pos - 1))) << 56)
      );
    }

    @inline
    sfixed64(): i64 {
      return i64(this.fixed64());
    }

    @inline
    float(): f32 {
      return f32.reinterpret_i32(this.fixed32());
    }

    @inline
    double(): f64 {
      return f64.reinterpret_i64(this.fixed64());
    }

    @inline
    bool(): boolean {
      return this.uint32() > 0;
    }

    /**
     * Reads and returns UTF8 string.
     * @returns String
     */
    string(): string {
      const length = this.uint32();
      if (this.pos + length > this.byteLength) {
        this.throwOutOfRange();
      }

      const p = this.pos + this.view.byteOffset;
      const value = String.UTF8.decode(this.view.buffer.slice(p, p + length));
      this.pos += length;
      return value;
    }

    /**
     * Reads and returns bytes array.
     * @returns Array<u8> of bytes
     */
    bytes(): Array<u8> {
      const len = this.uint32();
      if (this.pos + len > this.byteLength) {
        this.throwOutOfRange();
      }

      const a = new Array<u8>(len);
      for (let i: u32 = 0; i < len; i++) {
        a[i] = u8(this.u8at(this.pos++));
      }

      return a;
    }

    /**
     * Skips a message field if it can'be recognized by an object's decode() method
     * @param wireType Current wire type
     */
    skipType(wireType: u32): void {
      switch (wireType) {
        // int32, int64, uint32, uint64, sint32, sint64, bool, enum: varint, variable length
        case 0:
          this.varint(); // Just read a varint
          break;
        // fixed64, sfixed64, double: 8 bytes always
        case 1:
          this.skip(8);
          break;
        // length-delimited; length is determined by varint32; skip length bytes;
        case 2:
          this.skip(this.uint32());
          break;
        // tart group: skip till the end of the group, then skip group end marker
        case 3:
          while ((wireType = this.uint32() & 7) !== 4) {
            this.skipType(wireType);
          }
          break;
        // fixed32, sfixed32, float: 4 bytes always
        case 5:
          this.skip(4);
          break;

        // Something went beyond our capability to understand
        default:
          throw new Error(
            `Invalid wire type ${wireType} at offset ${this.pos}`
          );
      }
    }

    /**
     * Fast-forwards cursor by length with boundary check
     * @param length Byte length
     */
    skip(length: u32): void {
      if (this.pos + length > this.byteLength) {
        this.throwOutOfRange();
      }
      this.pos += length;
    }

    /**
     * OutOfRange check. Throws an exception if current position exceeds current buffer range
     */
    @inline
    private throwOutOfRange(): void {
      throw new Error(`Decoder position ${this.pos} is out of range!`);
    }
  }

  class SafeDecoder extends Decoder {
    public _invalid: boolean;
    invalid(): boolean {
      if (this._invalid) return true;
      if (this.pos > MAX_POS) {
        this._invalid = true;
        return true;
      }
      return false;
    }
    string(): string {
      if (this.invalid()) return "";
      const length = this.uint32();
      if (this.pos + length > this.byteLength) {
        this._invalid = true;
        return "";
      }
      const p = this.pos + this.view.byteOffset;
      const value = String.UTF8.decode(this.view.buffer.slice(p, p + length));
      this.pos += length;
      return value;
    }
    @inline
    sfixed64(): i64 {
      if (this.invalid()) return 0;
      return i64(this.fixed64());
    }

    @inline
    float(): f32 {
      if (this.invalid()) return 0;
      return f32.reinterpret_i32(this.fixed32());
    }

    @inline
    double(): f64 {
      if (this.invalid()) return 0;
      return f64.reinterpret_i64(this.fixed64());
    }

    @inline
    bool(): boolean {
      if (this.invalid()) return false;
      return this.uint32() > 0;
    }
    fixed64(): u64 {
      if (this.invalid()) return 0;
      this.pos += 8;
      if (this.pos > this.byteLength || this.pos > MAX_POS) {
        this._invalid = true;
        return <u64>0;
      }

      return (
        u64(u8(this.u8at(this.pos - 8))) |
        (u64(u8(this.u8at(this.pos - 7))) << 8) |
        (u64(u8(this.u8at(this.pos - 6))) << 16) |
        (u64(u8(this.u8at(this.pos - 5))) << 24) |
        (u64(u8(this.u8at(this.pos - 4))) << 32) |
        (u64(u8(this.u8at(this.pos - 3))) << 40) |
        (u64(u8(this.u8at(this.pos - 2))) << 48) |
        (u64(u8(this.u8at(this.pos - 1))) << 56)
      );
    }
    eof(): boolean {
      if (this.invalid()) return true;
      return super.eof();
    }
    varint(): u64 {
      if (this.invalid()) return 0;
      let value: u64;

      // u32
      value = (u64(u8(this.u8at(this.pos))) & 127) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 7)) >>> 0;
      if (this.pos + 1 > MAX_POS) {
        this._invalid = true;
        return 0;
      }
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 14)) >>> 0;
      if (this.pos + 1 > MAX_POS) {
        this._invalid = true;
        return 0;
      }
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 21)) >>> 0;
      if (this.pos + 1 > MAX_POS) {
        this._invalid = true;
        return 0;
      }
      if (u8(this.u8at(this.pos++)) < 128) return value;
      // u32 remainder or u64 byte
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 28)) >>> 0;
      if (this.pos + 1 > MAX_POS) {
        this._invalid = true;
        return 0;
      }
      if (u8(this.u8at(this.pos++)) < 128) return value;
      // u64
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 35)) >>> 0;
      if (this.pos + 1 > MAX_POS) {
        this._invalid = true;
        return 0;
      }
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value =
        (value | ((u64(u8(this.u8at(this.pos))) & 127) << 42)) /* 42!!! */ >>>
        0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 49)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 28)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      // u64 remainder
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 35)) >>> 0;
      if (this.pos + 1 > MAX_POS) {
        this._invalid = true;
        return 0;
      }
      if (u8(this.u8at(this.pos++)) < 128) return value;

      if (this.pos > this.byteLength || this.pos > MAX_POS) {
        this._invalid = true;
        return 0;
      }

      return value;
    }
    fixed32(): u32 {
      if (this.invalid()) return 0;
      this.pos += 4;
      if (this.pos > this.byteLength || this.pos > MAX_POS) {
        this._invalid = true;
        return <u32>0;
      }

      // u32(u8) ensures that u8(-1) becomes u32(4294967295) instead of u8(255)
      return (
        u32(u8(this.u8at(this.pos - 4))) |
        (u32(u8(this.u8at(this.pos - 3))) << 8) |
        (u32(u8(this.u8at(this.pos - 2))) << 16) |
        (u32(u8(this.u8at(this.pos - 1))) << 24)
      );
    }
    bytes(): Array<u8> {
      if (this.invalid()) return new Array<u8>(0);
      const len = this.uint32();
      if (this.pos + len > this.byteLength || this.pos + len > MAX_POS) {
        this._invalid = true;
        return new Array<u8>(0);
      }
      const a = new Array<u8>(len);
      for (let i: u32 = 0; i < len; i++) {
        a[i] = u8(this.u8at(this.pos++));
      }

      return a;
    }
    skipType(wireType: u32): void {
      if (this.invalid()) return;
      switch (wireType) {
        // int32, int64, uint32, uint64, sint32, sint64, bool, enum: varint, variable length
        case 0:
          this.varint(); // Just read a varint
          break;
        // fixed64, sfixed64, double: 8 bytes always
        case 1:
          this.skip(8);
          break;
        // length-delimited; length is determined by varint32; skip length bytes;
        case 2:
          this.skip(this.uint32());
          break;
        // tart group: skip till the end of the group, then skip group end marker
        case 3:
          while ((wireType = this.uint32() & 7) !== 4) {
            this.skipType(wireType);
          }
          break;
        // fixed32, sfixed32, float: 4 bytes always
        case 5:
          this.skip(4);
          break;

        // Something went beyond our capability to understand
        default:
          this._invalid = true;
          break;
      }
    }
    skip(length: u32): void {
      if (this.invalid()) return;
      if (this.pos + length > this.byteLength || this.pos + length > MAX_POS) {
        this._invalid = true;
      }
      this.pos += length;
    }
  }

  /**
   * Encoder implements protobuf message encode interface. This is the simplest not very effective version, which uses
   * Array<u8>.
   *
   * Useful references:
   *
   * Protocol Buffer encoding: https://developers.google.com/protocol-buffers/docs/encoding
   * LEB128 encoding AKA varint 128 encoding: https://en.wikipedia.org/wiki/LEB128
   * ZigZag encoding/decoding (s32/s64): https://gist.github.com/mfuerstenau/ba870a29e16536fdbaba
   */
  export class Encoder {
    public buf: Array<u8>;

    constructor(buf: Array<u8>) {
      this.buf = buf;
    }

    /**
     * Encodes varint at a current position
     * @returns Returns varint
     */
    varint64(value: u64): void {
      let v: u64 = value;

      while (v > 127) {
        this.buf.push(u8((v & 127) | 128));
        v = v >> 7;
      }

      this.buf.push(u8(v));
    }

    @inline
    int32(value: i32): void {
      this.varint64(value);
    }

    @inline
    int64(value: i64): void {
      this.varint64(value);
    }

    @inline
    uint32(value: u32): void {
      this.varint64(value);
    }

    @inline
    uint64(value: u64): void {
      this.varint64(value);
    }

    @inline
    sint32(value: i32): void {
      this.varint64((value << 1) ^ (value >> 31));
    }

    @inline
    sint64(value: i64): void {
      this.varint64((value << 1) ^ (value >> 63));
    }

    @inline
    fixed32(value: u32): void {
      this.buf.push(u8(value & 255));
      this.buf.push(u8((value >> 8) & 255));
      this.buf.push(u8((value >> 16) & 255));
      this.buf.push(u8(value >> 24));
    }

    @inline
    sfixed32(value: i32): void {
      this.fixed32(u32(value));
    }

    @inline
    fixed64(value: u64): void {
      this.buf.push(u8(value & 255));
      this.buf.push(u8((value >> 8) & 255));
      this.buf.push(u8((value >> 16) & 255));
      this.buf.push(u8((value >> 24) & 255));
      this.buf.push(u8((value >> 32) & 255));
      this.buf.push(u8((value >> 40) & 255));
      this.buf.push(u8((value >> 48) & 255));
      this.buf.push(u8(value >> 56));
    }

    @inline
    sfixed64(value: i64): void {
      this.fixed64(u64(value));
    }

    @inline
    float(value: f32): void {
      this.fixed32(u32(i32.reinterpret_f32(value)));
    }

    @inline
    double(value: f64): void {
      this.fixed64(u64(i64.reinterpret_f64(value)));
    }

    @inline
    bool(value: boolean): void {
      this.buf.push(value ? 1 : 0);
    }

    string(value: string): void {
      const utf8string = new DataView(String.UTF8.encode(value));

      for (let i = 0; i < utf8string.byteLength; i++) {
        this.buf.push(utf8string.getUint8(i));
      }
    }

    @inline
    bytes(value: Array<u8>): void {
      for (let i = 0; i < value.length; i++) {
        this.buf.push(value[i]);
      }
    }
  }

  /**
   * Returns byte size required to encode a value of a certain type
   */
  export class Sizer {
    static varint64(value: u64): u32 {
      return value < 128
        ? 1 // 2^7
        : value < 16384
        ? 2 // 2^14
        : value < 2097152
        ? 3 // 2^21
        : value < 268435456
        ? 4 // 2^28
        : value < 34359738368
        ? 5 // 2^35
        : value < 4398046511104
        ? 6 // 2^42
        : value < 562949953421312
        ? 7 // 2^49
        : value < 72057594037927936
        ? 8 // 2^56
        : value < 9223372036854775808
        ? 9 // 2^63
        : 10;
    }

    @inline
    static int32(value: i32): u32 {
      return Sizer.varint64(u64(value));
    }

    @inline
    static int64(value: i64): u32 {
      return Sizer.varint64(u64(value));
    }

    @inline
    static uint32(value: u32): u32 {
      return Sizer.varint64(value);
    }

    @inline
    static uint64(value: u64): u32 {
      return Sizer.varint64(value);
    }

    @inline
    static sint32(value: i32): u32 {
      return Sizer.varint64((value << 1) ^ (value >> 31));
    }

    @inline
    static sint64(value: i64): u32 {
      return Sizer.varint64((value << 1) ^ (value >> 63));
    }

    @inline
    static string(value: string): u32 {
      return value.length;
    }

    @inline
    static bytes(value: Array<u8>): u32 {
      return value.length;
    }
  }
}
export namespace protorune {
  export class RuneId {
    public height: u32;
    public txindex: u32;

    // Decodes RuneId from an ArrayBuffer
    static decode(buf: ArrayBuffer): RuneId {
      return RuneId.decodeDataView(new DataView(buf));
    }

    // Decodes RuneId from a DataView
    static decodeDataView(view: DataView): RuneId {
      const decoder = new __proto.SafeDecoder(view);
      const obj = new RuneId();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.height = decoder.uint32();
            break;
          }
          case 2: {
            obj.txindex = decoder.uint32();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      if (decoder.invalid()) return changetype<RuneId>(0);
      return obj;
    } // decode RuneId

    public size(): u32 {
      let size: u32 = 0;

      size += this.height == 0 ? 0 : 1 + __proto.Sizer.uint32(this.height);
      size += this.txindex == 0 ? 0 : 1 + __proto.Sizer.uint32(this.txindex);

      return size;
    }

    // Encodes RuneId to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array())
      );
    }

    // Encodes RuneId to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>())
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.height != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.height);
      }
      if (this.txindex != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.txindex);
      }

      return buf;
    } // encode RuneId
  } // RuneId

  export class Outpoint {
    public txid: Array<u8> = new Array<u8>();
    public vout: u32;

    // Decodes Outpoint from an ArrayBuffer
    static decode(buf: ArrayBuffer): Outpoint {
      return Outpoint.decodeDataView(new DataView(buf));
    }

    // Decodes Outpoint from a DataView
    static decodeDataView(view: DataView): Outpoint {
      const decoder = new __proto.SafeDecoder(view);
      const obj = new Outpoint();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.txid = decoder.bytes();
            break;
          }
          case 2: {
            obj.vout = decoder.uint32();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      if (decoder.invalid()) return changetype<Outpoint>(0);
      return obj;
    } // decode Outpoint

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.txid.length > 0
          ? 1 + __proto.Sizer.varint64(this.txid.length) + this.txid.length
          : 0;
      size += this.vout == 0 ? 0 : 1 + __proto.Sizer.uint32(this.vout);

      return size;
    }

    // Encodes Outpoint to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array())
      );
    }

    // Encodes Outpoint to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>())
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.txid.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.txid.length);
        encoder.bytes(this.txid);
      }
      if (this.vout != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.vout);
      }

      return buf;
    } // encode Outpoint
  } // Outpoint
} // protorune
export namespace quorum {
  export class Range {
    public start: Array<u8> = new Array<u8>();
    public end: Array<u8> = new Array<u8>();

    // Decodes Range from an ArrayBuffer
    static decode(buf: ArrayBuffer): Range {
      return Range.decodeDataView(new DataView(buf));
    }

    // Decodes Range from a DataView
    static decodeDataView(view: DataView): Range {
      const decoder = new __proto.SafeDecoder(view);
      const obj = new Range();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.start = decoder.bytes();
            break;
          }
          case 2: {
            obj.end = decoder.bytes();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      if (decoder.invalid()) return changetype<Range>(0);
      return obj;
    } // decode Range

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.start.length > 0
          ? 1 + __proto.Sizer.varint64(this.start.length) + this.start.length
          : 0;
      size +=
        this.end.length > 0
          ? 1 + __proto.Sizer.varint64(this.end.length) + this.end.length
          : 0;

      return size;
    }

    // Encodes Range to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array())
      );
    }

    // Encodes Range to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>())
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.start.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.start.length);
        encoder.bytes(this.start);
      }
      if (this.end.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.end.length);
        encoder.bytes(this.end);
      }

      return buf;
    } // encode Range
  } // Range

  export class RangeResult {
    public ranges: Array<Range> = new Array<Range>();

    // Decodes RangeResult from an ArrayBuffer
    static decode(buf: ArrayBuffer): RangeResult {
      return RangeResult.decodeDataView(new DataView(buf));
    }

    // Decodes RangeResult from a DataView
    static decodeDataView(view: DataView): RangeResult {
      const decoder = new __proto.SafeDecoder(view);
      const obj = new RangeResult();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.ranges.push(
              Range.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length
                )
              )
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      if (decoder.invalid()) return changetype<RangeResult>(0);
      return obj;
    } // decode RangeResult

    public size(): u32 {
      let size: u32 = 0;

      for (let n: i32 = 0; n < this.ranges.length; n++) {
        const messageSize = this.ranges[n].size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes RangeResult to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array())
      );
    }

    // Encodes RangeResult to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>())
    ): Array<u8> {
      const buf = encoder.buf;

      for (let n: i32 = 0; n < this.ranges.length; n++) {
        const messageSize = this.ranges[n].size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          this.ranges[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode RangeResult
  } // RangeResult

  export class RuneRange {
    public totalSupply: Array<u8> = new Array<u8>();
    public ranges: Array<RangeResult> = new Array<RangeResult>();

    // Decodes RuneRange from an ArrayBuffer
    static decode(buf: ArrayBuffer): RuneRange {
      return RuneRange.decodeDataView(new DataView(buf));
    }

    // Decodes RuneRange from a DataView
    static decodeDataView(view: DataView): RuneRange {
      const decoder = new __proto.SafeDecoder(view);
      const obj = new RuneRange();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.totalSupply = decoder.bytes();
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.ranges.push(
              RangeResult.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length
                )
              )
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      if (decoder.invalid()) return changetype<RuneRange>(0);
      return obj;
    } // decode RuneRange

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.totalSupply.length > 0
          ? 1 +
            __proto.Sizer.varint64(this.totalSupply.length) +
            this.totalSupply.length
          : 0;

      for (let n: i32 = 0; n < this.ranges.length; n++) {
        const messageSize = this.ranges[n].size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes RuneRange to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array())
      );
    }

    // Encodes RuneRange to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>())
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.totalSupply.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.totalSupply.length);
        encoder.bytes(this.totalSupply);
      }

      for (let n: i32 = 0; n < this.ranges.length; n++) {
        const messageSize = this.ranges[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          this.ranges[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode RuneRange
  } // RuneRange

  export class RuneRangeInput {
    public outpoints: Array<protorune.Outpoint> =
      new Array<protorune.Outpoint>();
    public rune: protorune.RuneId = new protorune.RuneId();
    public protocolId: Array<u8> = new Array<u8>();

    public ___protocolId: string = "";
    public ___protocolId_index: u8 = 0;

    static readonly PROTOCOL_ID_PROTOCOL_ID_INDEX: u8 = 3;

    // Decodes RuneRangeInput from an ArrayBuffer
    static decode(buf: ArrayBuffer): RuneRangeInput {
      return RuneRangeInput.decodeDataView(new DataView(buf));
    }

    // Decodes RuneRangeInput from a DataView
    static decodeDataView(view: DataView): RuneRangeInput {
      const decoder = new __proto.SafeDecoder(view);
      const obj = new RuneRangeInput();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.outpoints.push(
              protorune.Outpoint.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length
                )
              )
            );
            decoder.skip(length);

            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.rune = protorune.RuneId.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length
              )
            );
            decoder.skip(length);

            break;
          }
          case 3: {
            obj.protocolId = decoder.bytes();
            obj.___protocolId = "protocolId";
            obj.___protocolId_index = 3;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      if (decoder.invalid()) return changetype<RuneRangeInput>(0);
      return obj;
    } // decode RuneRangeInput

    public size(): u32 {
      let size: u32 = 0;

      for (let n: i32 = 0; n < this.outpoints.length; n++) {
        const messageSize = this.outpoints[n].size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.rune != null) {
        const f: protorune.RuneId = this.rune as protorune.RuneId;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.protocolId.length > 0
          ? 1 +
            __proto.Sizer.varint64(this.protocolId.length) +
            this.protocolId.length
          : 0;

      return size;
    }

    // Encodes RuneRangeInput to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array())
      );
    }

    // Encodes RuneRangeInput to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>())
    ): Array<u8> {
      const buf = encoder.buf;

      for (let n: i32 = 0; n < this.outpoints.length; n++) {
        const messageSize = this.outpoints[n].size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          this.outpoints[n].encodeU8Array(encoder);
        }
      }

      if (this.rune != null) {
        const f = this.rune as protorune.RuneId;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.protocolId.length > 0) {
        encoder.uint32(0x1a);
        encoder.uint32(this.protocolId.length);
        encoder.bytes(this.protocolId);
      }

      return buf;
    } // encode RuneRangeInput
  } // RuneRangeInput
} // quorum
