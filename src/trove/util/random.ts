import { WINDOW_CRYPTO } from "../trove_constants";

export const randomInt = (max: number) => {
  // This needs a security review. I think it is safe for low values of max.
  if (max > 100000) {
    throw "This method is not intended for large values. It requires a security review.";
  }
  // I'm trying to replicate Math.random()
  const mathRandom =
    WINDOW_CRYPTO.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
  return Math.min(Math.floor(mathRandom * max), max - 1);
};

export const randomOrder = (size: number) => {
  let order: number[] = [];
  for (let i = 0; i < size; ++i) {
    order.push(i);
  }
  for (let i = 0; i < order.length; ++i) {
    const temp = order[i];
    const randomIndexAfter = randomInt(order.length);
    order[i] = order[randomIndexAfter];
    order[randomIndexAfter] = temp;
  }
  return order;
};
