//@ts-ignore
@inline
export function mixin<T>(): T {
  return changetype<T>(0);
}

export function flatten<T>(ary: Array<Array<T>>): Array<T> {
  const result = new Array<T>(0);
  for (let i = 0; i < ary.length; i++) {
    for (let j = 0; j < ary[i].length; j++) {
      result.push(ary[i][j]);
    }
  }
  return result;
}
