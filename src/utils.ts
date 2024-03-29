export function unreachable(x : never) {
  throw new Error(`This should be unreachable! but got ${x}`)
}

// http://jsfiddle.net/jongobar/sNKWK/
export const getColorByValue = (value: number) => {
  const modifiedValue = ((1 - value) * (1 - value));
  const hue=((1-modifiedValue)*120).toString(10);
  return ["hsla(",hue,",70%,70%,80%)"].join("");
};