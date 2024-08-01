@inline
export function mixin<T>(): T {
  return changetype<T>(0);
}
