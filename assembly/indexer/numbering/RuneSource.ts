import { u128 } from "as-bignum/assembly";
import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import {
  isEqualArrayBuffer,
  min,
  toArrayBuffer,
} from "metashrew-runes/assembly/utils";
import { console, encodeHexFromBuffer } from "metashrew-as/assembly/utils";

export class RuneSource {
  public points: Array<u128>;
  public distances: Array<u128>;
  public index: i32;
  public offset: u128;
  public table: BSTU128;
  constructor(table: BSTU128, points: Array<u128>, limit: u128) {
    this.points = points;
    this.distances = new Array<u128>(points.length);
    this.offset = u128.from(0);
    this.index = 0;
    this.table = table;
    for (let i: i32 = 0; i < points.length; i++) {
      this.distances[i] = min(table.seekGreater(points[i]), limit);
    }
  }
  refetch(limit: u128): void {
    for (let i: i32 = 0; i < this.points.length; i++) {
      this.distances[i] = min(this.table.seekGreater(this.points[i]), limit);
    }
  }
  pull(): RuneSource {
    return this.points.reduce(
      (r: RuneSource, v: u128, i: i32, ary: Array<u128>) => {
        r.table.set(v, new ArrayBuffer(0));
        return r;
      },
      this,
    );
  }
  consumed(): boolean {
    if (this.index >= this.points.length) return true;
    return (
      this.index === this.points.length - 1 &&
      this.offset >= this.distances[this.distances.length - 1]
    );
  }
  updateAndPreserve(
    prefix: IndexPointer,
    source: ArrayBuffer,
    target: ArrayBuffer,
    protocolTag: u128,
  ): void {
    const sourcePointer = prefix.select(source);
    const targetPointer = prefix.select(target);
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      if (isEqualArrayBuffer(this.table.get(point), source)) {
        this.table.set(point, target);
      }
    }
    sourcePointer.getList().reduce((ptr, v) => {
      ptr.append(v);
      return ptr;
    }, targetPointer);
    targetPointer.keyword("/protocol").set(toArrayBuffer(protocolTag));
  }
  pipeTo(
    prefix: IndexPointer,
    target: ArrayBuffer,
    value: u128,
    protocolTag: u128,
  ): u128 {
    let remaining = value;
    const pointer = prefix.select(target);
    while (!this.consumed()) {
      const rangeRemaining = this.distances[this.index] - this.offset;
      const valueToApply = min(rangeRemaining, remaining);
      const point = this.points[this.index] + this.offset;
      this.table.set(point, target);
      const keyBytes = toArrayBuffer(point);
      pointer.keyword("/protocol").set(toArrayBuffer(protocolTag));
      pointer.append(keyBytes);
      this.offset += valueToApply;
      remaining -= valueToApply;
      if (this.offset === this.distances[this.index]) {
        this.index++;
        this.offset = u128.from(0);
      }
      if (remaining.isZero()) break;
    }
    return remaining;
  }
}
