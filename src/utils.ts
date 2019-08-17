export function unreachable(x : never) {
  throw new Error(`This should be unreachable! but got ${x}`)
}