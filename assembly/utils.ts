
@inline
export function mixin<T>(): T {
  //use arbitrary value
  return changetype<T>(2000);
}
